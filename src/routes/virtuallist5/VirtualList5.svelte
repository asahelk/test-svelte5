<svelte:options accessors />

<script context="module" lang="ts">
	/**
	 * the third argument for event bundler
	 * @see https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md
	 */
	const thirdEventArg = (() => {
		let result = false;

		try {
			const arg = Object.defineProperty({}, 'passive', {
				get() {
					// @ts-ignore
					result = { passive: true };
					return true;
				},
			});
			// @ts-ignore
			window.addEventListener('testpassive', arg, arg);
			// @ts-ignore
			window.remove('testpassive', arg, arg);
		} catch (e) {
			/* */
		}

		return result;
	})();
</script>

<script lang="ts">
	import { onMount, onDestroy, createEventDispatcher, type Snippet } from 'svelte';

	import { DIRECTION, SCROLL_CHANGE_REASON, SCROLL_PROP, SCROLL_PROP_LEGACY, type Direction } from './constants';

	import SizeAndPositionManager, { type Alignment } from './SizeAndPositionManager';
	import { flip } from 'svelte/animate';
	import { useActions, type ActionArray } from './useActions';

	export let height: number | string;
	export let width: number | string | undefined = '100%';

	export let itemCount: number;
	export let itemSize: number | ((index: number) => number);
	export let estimatedItemSize: number | null | undefined = null;
	export let stickyIndices: number[] | null | undefined = null;
	export let getKey: ((index: number) => any) | null | undefined = null;

	export let scrollDirection: Direction = DIRECTION.VERTICAL;
	export let scrollOffset: number | undefined = undefined;
	export let scrollToIndex: number | undefined = undefined;
	export let scrollToAlignment: Alignment | undefined = undefined;
	export let scrollToBehaviour: ScrollBehavior = 'instant';

	export let overscanCount: number = 3;
	export let use: ActionArray = [];
	export let header: Snippet | undefined = undefined;
	export let footer: Snippet | undefined = undefined;
	export let theItem: Snippet<[style: string, index: number]>;

	const dispatchEvent = createEventDispatcher();

	const sizeAndPositionManager = new SizeAndPositionManager({
		itemCount,
		itemSize,
		estimatedItemSize: getEstimatedItemSize(),
	});

	let mounted = false;
	let wrapper: HTMLDivElement | undefined;
	let items: { index: number; style: string }[] = [];

	let _state: {
		offset: number | undefined;
		scrollChangeReason: typeof SCROLL_CHANGE_REASON.REQUESTED | typeof SCROLL_CHANGE_REASON.OBSERVED;
	} = {
		offset: scrollOffset || (scrollToIndex != null && items.length && getOffsetForIndex(scrollToIndex)) || 0,
		scrollChangeReason: SCROLL_CHANGE_REASON.REQUESTED,
	};

	let prevState = _state;
	let prevProps = {
		scrollToIndex,
		scrollToAlignment,
		scrollOffset,
		itemCount,
		itemSize,
		estimatedItemSize,
	};

	let styleCache: Record<string, string> = {};
	let wrapperStyle = '';
	let innerStyle = '';

	$: {
		// listen to updates:
		scrollToIndex, scrollToAlignment, scrollOffset, itemCount, itemSize, estimatedItemSize;
		// on update:
		propsUpdated();
	}

	$: {
		// listen to updates:
		_state;
		// on update:
		stateUpdated();
	}

	$: {
		// listen to updates:
		height, width, stickyIndices;
		// on update:
		if (mounted) recomputeSizes(0); // call scroll.reset
	}

	refresh(); // Initial Load

	onMount(() => {
		mounted = true;

		wrapper?.addEventListener('scroll', handleScroll, thirdEventArg);

		if (scrollOffset != null) {
			scrollTo(scrollOffset);
		} else if (scrollToIndex != null) {
			scrollTo(getOffsetForIndex(scrollToIndex));
		}
	});

	onDestroy(() => {
		if (mounted) wrapper?.removeEventListener('scroll', handleScroll);
	});

	function propsUpdated() {
		if (!mounted) return;

		const scrollPropsHaveChanged = prevProps.scrollToIndex !== scrollToIndex || prevProps.scrollToAlignment !== scrollToAlignment;
		const itemPropsHaveChanged = prevProps.itemCount !== itemCount || prevProps.itemSize !== itemSize || prevProps.estimatedItemSize !== estimatedItemSize;

		if (itemPropsHaveChanged) {
			sizeAndPositionManager.updateConfig({
				itemSize,
				itemCount,
				estimatedItemSize: getEstimatedItemSize(),
			});

			recomputeSizes();
		}

		if (prevProps.scrollOffset !== scrollOffset) {
			_state = {
				offset: scrollOffset || 0,
				scrollChangeReason: SCROLL_CHANGE_REASON.REQUESTED,
			};
		} else if (typeof scrollToIndex === 'number' && (scrollPropsHaveChanged || itemPropsHaveChanged)) {
			_state = {
				offset: getOffsetForIndex(scrollToIndex, scrollToAlignment, itemCount),

				scrollChangeReason: SCROLL_CHANGE_REASON.REQUESTED,
			};
		}

		prevProps = {
			scrollToIndex,
			scrollToAlignment,
			scrollOffset,
			itemCount,
			itemSize,
			estimatedItemSize,
		};
	}

	function stateUpdated() {
		if (!mounted) return;

		const { offset, scrollChangeReason } = _state;

		if (prevState.offset !== offset || prevState.scrollChangeReason !== scrollChangeReason) {
			refresh();
		}

		if (prevState.offset !== offset && scrollChangeReason === SCROLL_CHANGE_REASON.REQUESTED && typeof offset === 'number') {
			scrollTo(offset);
		}

		prevState = _state;
	}

	function refresh() {
		const { offset } = _state;

		let updatedItems = [];

		const totalSize = sizeAndPositionManager.getTotalSize();

		const heightUnit = typeof height === 'number' ? 'px' : '';
		const widthUnit = typeof width === 'number' ? 'px' : '';
		if (scrollDirection === DIRECTION.VERTICAL) {
			wrapperStyle = `height:${height}${heightUnit};width:${width}${widthUnit};`;
			innerStyle = `flex-direction:column;height:${totalSize}px;`;
		} else {
			wrapperStyle = `height:${height}${heightUnit};width:${width}${widthUnit};`;
			innerStyle = `min-height:100%;width:${totalSize}px;`;
		}

		const hasStickyIndices = stickyIndices != null && stickyIndices.length !== 0;
		if (hasStickyIndices && stickyIndices) {
			for (let i = 0; i < stickyIndices.length; i++) {
				const index = stickyIndices[i];
				updatedItems.push({
					index,
					style: getStyle(index, true),
				});
			}
		}

		const { start, stop } = sizeAndPositionManager.getVisibleRange({
			containerSize: scrollDirection === DIRECTION.VERTICAL ? Number(height) : Number(width),
			offset: Number(offset),
			overscanCount,
		});

		if (start !== undefined && stop !== undefined) {
			for (let index = start; index <= stop; index++) {
				if (hasStickyIndices && stickyIndices?.includes(index)) {
					continue;
				}
				const { size } = sizeAndPositionManager.getSizeAndPositionForIndex(index);

				if (size)
					updatedItems.push({
						index,
						style: getStyle(index, false),
					});
			}

			dispatchEvent('itemsUpdated', {
				start,
				end: stop,
			});
		}

		items = updatedItems;
	}

	function scrollTo(value: number) {
		if (wrapper == null) return;
		if ('scroll' in wrapper) {
			wrapper.scroll({
				[SCROLL_PROP[scrollDirection]]: value,
				behavior: scrollToBehaviour,
			});
		} else {
			(wrapper as HTMLDivElement)[SCROLL_PROP_LEGACY[scrollDirection]] = value;
		}
	}

	export function recomputeSizes(startIndex = 0) {
		styleCache = {};
		sizeAndPositionManager.resetItem(startIndex);
		refresh();
	}

	function getOffsetForIndex(index: number, align = scrollToAlignment, _itemCount = itemCount) {
		if (index < 0 || index >= _itemCount) {
			index = 0;
		}

		return sizeAndPositionManager.getUpdatedOffsetForIndex({
			align,
			containerSize: scrollDirection === DIRECTION.VERTICAL ? Number(height) : Number(width),
			currentOffset: _state.offset || 0,
			targetIndex: index,
		});
	}

	function handleScroll(event: Event) {
		const offset = getWrapperOffset() ?? 0;

		if (offset < 0 || _state.offset === offset || event.target !== wrapper) return;

		_state = {
			offset,
			scrollChangeReason: SCROLL_CHANGE_REASON.OBSERVED,
		};

		dispatchEvent('afterScroll', {
			offset,
			event,
		});
	}

	function getWrapperOffset() {
		return wrapper?.[SCROLL_PROP_LEGACY[scrollDirection]];
	}

	function getEstimatedItemSize() {
		return estimatedItemSize || (typeof itemSize === 'number' && itemSize) || 50;
	}

	function getStyle(index: number, sticky: boolean) {
		if (styleCache[index]) return styleCache[index];

		const { size, offset } = sizeAndPositionManager.getSizeAndPositionForIndex(index);

		let style;

		if (scrollDirection === DIRECTION.VERTICAL) {
			style = `left:0;width:100%;height:${size}px;`;

			if (sticky) {
				style += `position:sticky;grow:0;z-index:99;top:0;margin-top:${offset}px;margin-bottom:${-(offset + size)}px;`;
			} else {
				style += `position:absolute;top:${offset}px;`;
			}
		} else {
			style = `top:0;width:${size}px;`;

			if (sticky) {
				style += `position:sticky;z-index:1;left:0;margin-left:${offset}px;margin-right:${-(offset + size)}px;`;
			} else {
				style += `position:absolute;height:100%;left:${offset}px;`;
			}
		}

		return (styleCache[index] = style);
	}

	export function getVisibleRange() {
		const { offset } = _state;
		return sizeAndPositionManager.getVisibleRange({
			containerSize: scrollDirection === DIRECTION.VERTICAL ? Number(height) : Number(width),
			offset: Number(offset),
			overscanCount,
		});
	}

	export function setVirtualItems(newItems: { index: number; style: string }[]) {
		items = newItems;
	}

	export function getVirtualItems(): { index: number; style: string }[] {
		return items;
	}
</script>

<div bind:this={wrapper} class="virtual-list-wrapper" style={wrapperStyle}>
	{#if header}
		{@render header?.()}
	{/if}

	<div class="virtual-list-inner" style={innerStyle} use:useActions={use} {...$$restProps}>
		{#each items as item (getKey ? getKey(item.index) : item.index)}
			<!-- <slot name="item" style={item.style} index={item.index} /> -->
			<div animate:flip={{ duration: 200 }} style="{item.style}; border: red solid 1px">
				{@render theItem?.(item.style, item.index)}
			</div>
		{/each}
	</div>

	{#if footer}
		{@render footer?.()}
	{/if}
</div>

<style>
	.virtual-list-wrapper {
		overflow: auto;
		will-change: transform;
		-webkit-overflow-scrolling: touch;
	}

	.virtual-list-inner {
		position: relative;
		display: flex;
		width: 100%;
	}
</style>

import type { Data } from "./data";

export const containersState: { containers: Data } = $state({
    containers: [],
});

function derivedAddresses() {
    const addresses: string[] = $derived(containersState.containers.flatMap((container) => container.addresses.flatMap((address) => address.street)));

    return {
        get addresses() { return addresses }
    }
}

export const derivedAddressesState = derivedAddresses();
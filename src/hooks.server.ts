import type { Handle } from "@sveltejs/kit";
import { paraglideMiddleware } from "$lib/paraglide/server";

const handleParaglide: Handle = ({ event, resolve }) => {
	return paraglideMiddleware(event.request, ({ request, locale }) => {
		if (
			event.url.pathname.startsWith(
				"/.well-known/appspecific/com.chrome.devtools",
			)
		) {
			return new Response(null, { status: 204 }); // Return empty response with 204 No Content
		}

		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) =>
				html.replace("%paraglide.lang%", locale),
		});
	});
}


export const handle: Handle = handleParaglide;

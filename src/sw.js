const CACHE_NAME = 'audiomass-zh-cn-v66';
const assets = [
	'./',
	'./manifest.json',
	'./ico.png',
	'./icon.png',
	'./index.html',
	'./main.css',
	'./dist/wavesurfer.js',
	'./dist/plugin/wavesurfer.regions.js',
	'./oneup.js',
	'./app.js',
	'./keys.js',
	'./markers.js',
	'./contextmenu.js',
	'./lufs.js',
	'./ui-fx.js',
	'./ui.js',
	'./modal.js',
	'./state.js',
	'./engine.js',
	'./actions.js',
	'./drag.js',
	'./recorder.js',
	'./welcome.js',
	'./fx-pg-eq.js',
	'./fx-auto.js',
	'./local.js',
	'./id3.js',
	'./lzma.js',
	'./amss-format.js',
	'./multitrack.js',
	'./i18n.js',
	'./recorder-worklet.js',
	'./tempo-estimator.js',
	'./tempo-worker.js',
	'./wav.js',
	'./lame.js',
	'./flac.js',
	'./libflac.js',
	'./libflac.wasm',
	'./lz4-block-codec-wasm.js',
	'./lz4-block-codec.wasm',
	'./rnn_denoise.js',
	'./rnn_denoise.wasm',
	'./fonts/icomoon.woff',
	'./eq.html',
	'./sp.html',
	'./mix.html'//, './test.mp3'
];

self.addEventListener( 'install', function ( event ) {
	event.waitUntil(( async function () {
		const cache = await caches.open( CACHE_NAME );
		await Promise.all( assets.map( function ( asset ) {
			return cache.add( new Request ( asset, { cache: 'reload' } ) ).catch( function () {
				console.warn( '[SW] Could not cache:', asset );
			});
		}));
	})());
});

self.addEventListener( 'activate', function ( event ) {
	event.waitUntil(( async function () {
		const keys = await caches.keys();
		await Promise.all( keys.map( function ( key ) {
			if ( key !== CACHE_NAME ) return caches.delete( key );
		}));
		await self.clients.claim();
	})());
});

self.addEventListener( 'fetch', async function ( event ) {
	const request = event.request;
	event.respondWith( cacheFirst( request ) );
});

self.addEventListener( 'message', function ( event ) {
	if ( event.data === 'SKIP_WAITING' ) self.skipWaiting();
});

async function cacheFirst( request ) {
	if ( request.method !== 'GET' ) return fetch( request );

	const cachedResponse = await caches.match( request, { ignoreSearch: true } );
	if ( cachedResponse === undefined ) return fetch( request );

	return cachedResponse;
}

(function ( w, d, PKAE ) {
'use strict';

setTimeout(function () {
	if (/(^|[?&])skipintro=1(&|$)/.test (w.location.search)) return ;
	var scroll_hint = 0;
	var showScrollHint = function () {
		var tbc, el, r;
		if (!PKAE.isMobile || scroll_hint) return ;
		scroll_hint = 1;
		tbc = PKAE.ui.el.getElementsByClassName ('pk_tbc')[0];
		if (!tbc || tbc.scrollWidth <= tbc.clientWidth + 2) return ;
		el = d.createElement ('i');
		r = tbc.getBoundingClientRect ();
		el.className = 'pk_tbhint';
		el.innerHTML = '&#8250;';
		el.style.top = ((r.top + r.height / 2 - 12) >> 0) + 'px';
		PKAE.ui.el.appendChild ( el );
		setTimeout (function () {
			el.parentNode && el.parentNode.removeChild ( el );
		}, 3000);
	};

	PKAudioEditor._deps.Wlc = function () {
			var body_str = '';
			var body_str2 = '';
			var mobile_note = '';

			if (PKAE.isMobile) {
				mobile_note = '（桌面端体验更佳，敬请谅解）<br/><br/>';
				body_str = '提示：<br/>请确认设备未处于静音模式。你可能需要拨动实体静音开关。'+
				'<img src="phone-switch.jpg" style="max-width:224px;max-height:126px;width:40%;margin: 10px auto; display: block;"/>'+
				'<br/><br/>';
			}
			else {
				body_str = '提示：<br/>大多数快捷键使用 <strong>Shift + <u>按键</u></strong> 组合，例如 Shift+Z 撤销、Shift+C 复制、Shift+X 剪切。<br/><br/>';
				body_str2 = '在 <a href="https://github.com/pkalogiros/audiomass" target="_blank">GitHub</a> 查看源代码。<br/><br/>'; // checkout the code on github
			}

			// Welcome to AudioMass,
			var md = new PKSimpleModal({
				title: '<font style="font-size:15px">欢迎使用 AudioMass</font>',
				ondestroy: function( q ) {
					PKAE.ui.InteractionHandler.on = false;
					PKAE.ui.KeyHandler.removeCallback ('modalTemp');
					showScrollHint ();
			},
			body:'<div style="overflow:auto;-webkit-overflow-scrolling:touch;max-width:580px;width:calc(100vw - 40px);max-height:calc(100vh - 340px);min-height:110px;font-size:13px; color:#95c6c6;padding-top:7px;">'+
				mobile_note+
				'AudioMass 是一款免费开源的网页音频与波形编辑器。<br />它完全在浏览器中运行，无需后端或插件！'+
				'<br/><br/>'+
				body_str+
				'可以加载浏览器支持的音频，并进行淡入、剪切、裁剪、调整音量，'+
				'以及应用各种音频效果。<br/><br/>'+
				body_str2+
				'希望你喜欢这些音乐片段，它们是我很久以前创作的。:)'+
				'</div>',
			setup:function( q ) {
					PKAE.ui.InteractionHandler.checkAndSet ('modal');
					PKAE.ui.KeyHandler.addCallback ('modalTemp', function ( e ) {
						q.Destroy ();
					}, [27]);

					// ------
					var scroll = q.el_body.getElementsByTagName('div')[0];
					scroll.addEventListener ('touchstart', function(e){
						e.stopPropagation ();
					}, false);
					scroll.addEventListener ('touchmove', function(e){
						e.stopPropagation ();
					}, false);

					// ------
				}
			});
			md.Show ();
			document.getElementsByClassName('pk_modal_cancel')[0].innerHTML = '&nbsp; &nbsp; &nbsp; 确定 &nbsp; &nbsp; &nbsp;';
	};

	var change = 99;
	var exists = w.localStorage && w.localStorage.getItem ('k');

	if (!exists) {
		change = 0;
		w.localStorage && w.localStorage.setItem ('k', 1);
	}

	if ( ((Math.random () * 100) >> 0) < change) return ;
	PKAudioEditor._deps.Wlc ();

}, 320);

})( window, document, PKAudioEditor );

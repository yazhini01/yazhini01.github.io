function talamTicker() {
	return {
		kriyas: [],
		kriyaIndex: 0,
		rootDiv: null,
		btnLabel: null,
		onTalamTick: function() {
			$('.kriya', this.rootDiv).removeClass('current');
			$('.kriya[data_akshara_index=' + this.kriyaIndex + ']', this.rootDiv).addClass('current');

			var file = kriyaToSoundFile[this.kriyas[this.kriyaIndex].split(" ")[0]];
			if (file) new Howl({urls: [file] }).play();

			this.kriyaIndex = (this.kriyaIndex + 1) % this.kriyas.length;
		},
		onBeforeTalamStart: function() {
			this.kriyaIndex = 0;
			$('.btn_tick', this.rootDiv).attr('value', "Stop");
			if (this.onStart) {
				this.onStart();
			}
		},
		onAfterTalamEnd: function() {
			$('.btn_tick', this.rootDiv).attr('value', this.btnLabel);
			if (this.onStop) {
				this.onStop();
			}
		},
		displayKriyasForMet: function() {
			var self = this;
			$(this.kriyas).each(function(index, kriya) {
				var $span = $("<span class='kriya'></span>");
				$span.text(kriya);
				$span.attr('data_akshara_index', index);
				$('.kriyas', self.rootDiv).append($span);
			});
			this.rootDiv[this.kriyas.length ? "show" : "hide"]();
		},
		setup: function(kriyas, isChapu, kriyaToSoundFile, rootDiv, btnLabel, onStart, onStop) {
			this.kriyas = kriyas; //talamToKriyas(talams[selectedTalam], selectedJaathi);
			this.kriyaToSoundFile = kriyaToSoundFile;
			this.rootDiv = rootDiv;
			this.btnLabel = btnLabel || "Tick in this talam";
			this.onStart = onStart;
			this.onStop = onStop;

			// setup the view
			this.rootDiv.empty();
			this.rootDiv.append($($("#sample_talam_ticker_wrapper").html()));
			this.displayKriyasForMet();
			$('.chapu', this.rootDiv)[isChapu ? 'show' : 'hide']();
			$('.suladi', this.rootDiv)[isChapu ? 'hide' : 'show']();
			$('.kriyas', this.rootDiv).show();
			$('.btn_tick', this.rootDiv).attr('value', this.btnLabel);

			this.talamTicker = new ticker(this.onTalamTick.bind(this, null), this.onBeforeTalamStart.bind(this, null), this.onAfterTalamEnd.bind(this, null));
			this.chapuTalamTicker = new setTimeoutBasedChapuTicker("talam", this.onTalamTick.bind(this, null), this.onBeforeTalamStart.bind(this, null), this.onAfterTalamEnd.bind(this, null));

			$('.btn_tick', this.rootDiv).bind('click', function() {
				if (isChapu) {
					this.chapuTalamTicker.toggleTicking(getChapuIntervalInput());
				} else {
					this.talamTicker.toggleTicking($('.bpm', this.rootDiv).val());
				}
			}.bind(this));
		},
		stop: function() {
			this.talamTicker.stopTicking();
			this.chapuTalamTicker.stopTicking();
		}
	};
}
var defaultValue = "taihataihi taihataihi takita takita taihataihi takita takita taihataihi takita takita taihataihi takita takita taihataihi  taihataihi taihataihi takita takita taihataihi takita takita taihataihi takita takita ddt ddt takita takita ddt ddt taihataihi taihataihi tttt tttt taihataihi taihataihi tttt tttt takita takita takita takita takita takita takita takita takita tttddt tha ta thi ta tddt tha , ta thi , ta tddt takadimi taka takita takadimi taka takita taihataihi taka takita tttddt tha ta thi ta tddt tha , ta thi , ta tddt taka taka taka taka taka ta ta ta taka taka taka taka taka taka taka tttddt tha ta thi ta tddt tha , ta thi , ta tddt";
var defaultMisraChapuIntervals = "200,200,200,300,300,300,300";
var defaultKandaChapuIntervals = "300,300,300,300,300";
var selectedTalam, selectedJaathi, selectedGati, selectedGatiInt;
var notatedSong = [],
	totalNotatedMatraCount = 0;
var $kriyas, $kriyas;
var talamTicker1 = new talamTicker();
var semicolon = new RegExp(/;/g);

function onTalamChange() {
	selectedTalam = $('select#talam :selected').attr('value');
	selectedJaathi = $('select#jaathi :selected').attr('value');
	selectedGati = isChapu() ? 2 : $('select#gati :selected').attr('value'); // sorry
	selectedGatiInt = parseInt(selectedGati);
	$('.suladi')[isChapu() ? 'hide' : 'show']();
	$('.chapu')[isChapu() ? 'show' : 'hide']();
	if (!$('#chapu_intervals').val().length) {
		if (selectedTalam == "misrachapu") {
			$('#chapu_intervals').val(defaultMisraChapuIntervals);
		} else if (selectedTalam == "kandachapu") {
			$('#chapu_intervals').val(defaultKandaChapuIntervals);
		}
	}

	talamTicker1.setup(
		talamToKriyas(selectedTalam, selectedJaathi),
		isChapu(),
		kriyaToSoundFile,
		$('#metronome .section_body'),
		"Tick at this talam");
	// setupSongWithTicker(talamTicker1, "sounds/melaprapti_1.mp3");
}

function isChapu() {
	return selectedTalam.endsWith("chapu");
}

function getChapuIntervalInput() {
	var intervals = $('#chapu_intervals').val().split(",");
	intervals = $(intervals).map(function(_, i) {
		return parseInt(i);
	});
	return intervals;
}
var currentSongIndex = 0;
var onSongTick = function() {
		$('.matra', $output).removeClass('current');
		var $currentKriya = $('.matra[data_matra_index=' + currentSongIndex + ']', $output);
		$currentKriya.addClass('current');
		var currentAksharaStart = Math.floor(currentSongIndex / selectedGati) * selectedGati;
		for (var i = currentAksharaStart; i < currentAksharaStart + selectedGatiInt; i++) {
			$('.matra[data_matra_index=' + i + ']', this.rootDiv).addClass('current');
		}

		currentSongIndex = (currentSongIndex + 1) % totalNotatedMatraCount;
	},
	onBeforeSongTickStart = function() {
		// onTalamChange();

		currentSongIndex = 0;
		$(".btn_play").attr('value', "Stop");
		talamTicker1.toggle();
	},
	onAfterSongTickEnd = function() {
		$(".btn_play").attr('value', "Play");
		talamTicker1.stop();
	};
var songTicker = new ticker(onSongTick, onBeforeSongTickStart, onAfterSongTickEnd);
var chapuSongTicker = new setTimeoutBasedChapuTicker("song", onSongTick, onBeforeSongTickStart, onAfterSongTickEnd);

$(document.body).ready(function() {
	$kriyas = $('#kriyas');
	$output = $('#output');
	onTalamChange();

	$('#input').val(defaultValue);
	$('.btn_notate').bind('click', function() {
		// onTalamChange();
		// print_info();
		notatedSong = notate(parseInput($('#input').val()));
		print_output(notatedSong);
	});

	$('select#talam').change(onTalamChange);
	$('select#jaathi').change(onTalamChange);
	$('select#gati').change(onTalamChange);

	$('.section .title').bind('click', function(e) {
		$('.section_body[data_section="' + $(e.currentTarget).attr('data_section') + '"]').toggle();
	});

	/*
		$('.btn_play').bind('click', function() {
			// $('.btn_notate').trigger('click');
			if (isChapu()) {
				// unit is milli seconds (not bpm)
				var intervals = [];
				$(getChapuIntervalInput()).each(function(_, i) {
					i = i / selectedGati;
					for (var j = 0; j < selectedGati; j++) intervals.push(i);
				});
				chapuSongTicker.toggleTicking(intervals);
			} else {
				songTicker.toggleTicking(talamTicker1.getBpm());
				// songTicker.toggleTicking(talamTicker1.getBpm() * selectedGati);
			}
		});
	*/

	$('.btn_mrid').bind('click', function() {
		var mridangamSyllables = inputToMridangamSyllables(parseInput($('#input').val()));
		notatedSong = notate(parseInput(mridangamSyllables.readable.join(" ")));
		print_output(notatedSong);

		// $('#input').val(mridangamSyllables.readable.join(" "));

		talamTicker1.setup(
			mridangamSyllables.playable,
			isChapu(),
			kriyaToSoundFile,
			$('#metronome .section_body'),
			"Don't click this button, it's broken",
			function() {
				$('.btn_mrid').attr('value', 'Stop');
			},
			function() {
				$('.btn_mrid').attr('value', 'Play as mridangam');
				songTicker.stopTicking();
			});

		songTicker.toggleTicking(talamTicker1.getBpm());
	});
	populateMridangamScript();
	preloadJathis();
});


function parseInput(input) {
	var outputLines = [];
	$(input.trim().split("\n\n")).each(function(_, chunk) {
		var lines = chunk.split("\n");
		if (!lines[0].endsWith("times")) {
			lines.unshift("1 times");
		}
		var times = parseInt(lines[0].split(" ")[0]);
		lines.splice(0, 1);

		var nonComments = [];
		$(lines).each(function(_, line) {
			if (!line.trim().startsWith("//")) {
				line = line.replace(semicolon, ', , ,');
				nonComments.push(line);
			}
		});
		lines = nonComments;

		while (times--) {
			outputLines = outputLines.concat(lines);
		}
	});

	return outputLines.join(" ").replace(/\s+/g, ' ');
}

function parseTalam(talam, jaathi, gati) {
	var angams = talams[talam],
		angaMatras = [],
		avartanamMatras = 0,
		header = [];
	for (var i = 0; i < angams.length; i++) {
		var matras = gati * (talam.endsWith("chapu") ? parseInt(angams[i]) : getAngaAksharaCount(angams[i], jaathi));
		angaMatras.push(matras);
		avartanamMatras += matras;
		for (var j = 1; j <= matras; j++) header.push("" + j);
	}
	return {
		angaMatras: angaMatras,
		avartanamMatras: avartanamMatras,
		header: header
	};
}

function print_info() {
	var talam = parseTalam(selectedTalam, selectedJaathi, selectedGati);
	var $info = $('#info');

	if (talam.avartanamMatras <= 0) {
		$info.text("Sorry, something went wrong");
		return;
	}
	var msg = "";
	if (!selectedTalam.endsWith("chapu")) {
		msg = $('select#talam :selected').text() + " = " + talams[selectedTalam] + ".";
		msg += " With " + selectedJaathi + " jaathi and " + selectedGati + " gati, it has ";

		var msg1 = "",
			msg2 = "";
		for (var i = 0; i < talams[selectedTalam].length; i++) {
			if (i) msg1 += "+", msg2 += "+";
			var aksharas = getAngaAksharaCount(talams[selectedTalam][i], selectedJaathi);
			msg1 += aksharas;
			msg2 += aksharas + "x" + selectedGati;
		}
		msg1 += " = " + (talam.avartanamMatras / parseInt(selectedGati)) + " aksharas";
		msg2 += " = " + (talam.avartanamMatras) + " matras";

		msg += msg1 + " and " + msg2 + " in an avartanam.";
	} else {
		if (selectedTalam == "misrachapu") {
			msg = $('select#talam :selected').text() + " has 14 counts in an avartanam (I think?).";
		} else if (selectedTalam == "kandachapu") {
			msg = $('select#talam :selected').text() + " has 10 counts in an avartanam (I think?).";
		}
	}
	$info.show();
	$info.text(msg);
}

function print_output(output) {
	$output.empty();
	totalNotatedMatraCount = 0;
	$(output).each(function(avartanamIndex, avartanam) {
		var $avartanam = $("<div class='avartanam'></div>");
		if (typeof avartanam === "string") {
			$('#error').show();
			$('#error').text(avartanam);
			return;
		}
		$('#error').hide();

		var separatedAvartanam = [
			["||"]
		];
		$(avartanam).each(function(i, angam) {
			separatedAvartanam.push(angam);
			if (i < avartanam.length - 1) separatedAvartanam.push([
				["|"]
			]);
		});
		separatedAvartanam.push([
			["||"]
		]);

		avartanam = separatedAvartanam;


		$(avartanam).each(function(_, angam) {
			var $angam = $("<div class='angam'></div>");
			$(angam).each(function(matraIndexInAngam, matra) {
				var $matra = $("<div class='matra'></div>")

				var dataMatraIndex = (avartanamIndex == 0 || matra == "||" || matra == "|") ? "" : totalNotatedMatraCount++;
				$matra.attr('data_matra_index', dataMatraIndex);
				$matra.addClass('matra_' + (Math.floor(matraIndexInAngam / selectedGati) % 2 ? 'odd' : 'even'));
				$matra.text(matra);
				$angam.append($matra);
			});
			$avartanam.append($angam);
		});

		$output.append($avartanam);
	});
}
var mridangamWords = [
	/*{
		readable: "bheem",
		notated_readable: "bheem ;",
		playable: "bheem ;"
	}, {
		readable: "cha",
		notated_readable: "cha ;",
		playable: "cha ;"
	}, {
		readable: "dheem",
		notated_readable: "dheem ;",
		playable: "dheem ;"
	}, {
		readable: "dhin",
		notated_readable: "dhin ;",
		playable: "dhin ;"
	}, {
		readable: "num",
		notated_readable: "num ;",
		playable: "num ;"
	}, {
		readable: "ta",
		notated_readable: "ta ;",
		playable: "ta ;"
	}, {
		readable: "tha",
		notated_readable: "tha ;",
		playable: "tha ;"
	}, {
		readable: "tham",
		notated_readable: "tham ;",
		playable: "tham ;"
	}, {
		readable: "thi",
		notated_readable: "thi ;",
		playable: "thi ;"
	}, {
		readable: "thom",
		notated_readable: "thom ;",
		playable: "thom ;"
	}, */
	{
		readable: "takadimi",
		notated_readable: "tha ; ka ; dhi ; mi ;", // FIXME: this is kitataka actually
		playable: "thi ; ta ; tha ; thi ;"
	}, {
		readable: "takita",
		notated_readable: "tha ; ki ; ta ;",
		playable: "tha ; thi ; ta ;"
	}, {
		readable: "taka",
		notated_readable: "tha ; ka ;",
		playable: "ta ; tha ;"
	}, {
		readable: "$",
		notated_readable: "ki ta tha ka ta ri ki ta thom ;",
		playable: "thi ta tha ta cha ta thi ta thom ;"
	}, {
		readable: "tttt",
		notated_readable: "tha ; thai ; thai ; tha ; dith ; thai ; thai ; tha ;",
		playable: "cha ; tha ; tha ; dhin ; cha ; tha ; tha ; dhin ;"
	}, {
		readable: "taihataihi",
		notated_readable: "tai ; ha ; tai ; hi ;",
		playable: "ta ; thi ; ta ; thi ;"
	}, {
		readable: "ddt",
		notated_readable: "dith , dith , thai ;",
		playable: "thi , thi , ta ;"
	}, {
		readable: "tddt",
		notated_readable: "thai ; dith , dith , thai ;",
		playable: "tha ; thi , thi , ta ;"
	}, {
		readable: "ttddt",
		notated_readable: "thai ; thai ; dith , dith , thai ;",
		playable: "tha ; tha ; thi , thi , ta ;"
	}, {
		readable: "tttddt",
		notated_readable: "thai ; thai ; thai ; dith , dith , thai ;",
		playable: "tha ; tha ; tha ; thi , thi , ta ;"
	}
];

function populateMridangamScript() {
	$('#script').empty();
	for (var sound in kriyaToSoundFile) {
		if (sound == "beat" || sound == "count" || sound == "wave") continue;

		var $btn = $("<input type=button class='btn btn-sm btn-warning btn-sound' value='" + sound + "'/>");
		$('#script').append($btn);
		$btn.bind('click', function(e) {
			new Howl({
				urls: [kriyaToSoundFile[$(e.currentTarget).attr('value')]]
			}).play()
		});
	}

	$(mridangamWords).each(function(index, datum) {
		var $scriptLine = $($('#mridangam_script_wrapper').html());
		$scriptLine.attr('data_index', index);
		('.btn', $scriptLine).attr('data_index', index);

		$('input', $scriptLine).bind('click', function() {
			$('#script .mridangam_script .btn').hide();
			$('.btn', $scriptLine).show();
		});
		$('.btn', $scriptLine).bind('click', function(e) {
			$('.btn', $scriptLine).show();
			print_output(notate(parseInput($('.notated_readable', $scriptLine).val())));

			var playable = parseInput($('.playable', $scriptLine).val());
			playable = playable.split(" ");


			talamTicker1.setup(
				playable,
				false,
				kriyaToSoundFile,
				$('#metronome .section_body'),
				"Play",
				function() {
					$('.btn_play_script', $scriptLine).attr('value', 'Stop');
				},
				function() {
					$('.btn_play_script', $scriptLine).attr('value', 'Play');
					songTicker.stopTicking();
				});
			songTicker.startTicking(talamTicker1.getBpm());
		});

		$('.playable', $scriptLine).attr('value', datum.playable);
		$('.notated_readable', $scriptLine).attr('value', datum.notated_readable);
		$('.readable', $scriptLine).attr('value', datum.readable);
		$('#script').append($scriptLine);
	});
	$('#script .mridangam_script .btn').hide();
}


var jathis = {
	"---": null,
	"Varnam - Trikala jathi, adi": 'jathis/varnam-jathi-1.txt',
	"Varnam - 2nd jathi, adi": 'jathis/varnam-jathi-2.txt',
	"Pushpanjali - Simmendramadhyamam": 'jathis/pushpanjali.txt',
	"Combination 1 (notation)": "jathis/combination-1-notation1.txt",
	"Combination 1 (beats)": "jathis/combination-1-beats.txt",
	"Combination 2 (notation)": "jathis/combination-2-notation.txt",
	"Combination 2 (beats)": "jathis/combination-2-beats.txt",
	"Combination 3 (notation)": "jathis/combination-3-notation.txt",
	"Combination 3 (beats)": "jathis/combination-3-beats.txt",
	"Combination 5 (notation)": "jathis/combination-5-notation.txt",
	"Combination 5 (beats)": "jathis/combination-5-beats.txt",
};

function preloadJathis() {
	for (var jathiName in jathis) {
		var $opt = $("<option data_file='" + jathis[jathiName] + "'>" + jathiName + "</option>");
		$('#jathis').append($opt);
	}
	$('select#jathis').change(function(e) {
		var dataFile = $('select#jathis :selected').attr('data_file');
		if (!dataFile) return;
		$.get(dataFile, function(jathi) {
			$('#input').val(jathi);
		});
	});
}
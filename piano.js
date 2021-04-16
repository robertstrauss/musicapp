


class Piano {
    // number of half steps from C a key can be to be white
    static cMajorScale = [0, 2, 4, 5, 7, 9, 11, 12];

    // middle C sound buffer
    static MIDDLEC = undefined;

    static loadSound() {
        // load the Middle C sound
        var request = new XMLHttpRequest();
        request.open('GET', 'middleC.wav')
        request.responseType = 'arraybuffer'
        request.onload = function() {
            (new AudioContext()).decodeAudioData(request.response, function(buffer) {
                Piano.MIDDLEC = buffer;
                ((function(){}))()
            }, function(msg) {console.error(msg)});
        }
        request.send();
    }

    constructor(element) {
        // create element
        var piano = document.createElement('div');
        element.append(piano);
        piano.classList.add('piano');

        // add stylesheet
        document.head.innerHTML += '<link rel="stylesheet" type="text/css" href="piano.css"/>';

        // audioContext for playing sounds
        this.audioContext = new AudioContext();

        // arrays of the source and gain objects for each key
        this.sources = {};
        this.gainNodes = {};

        this.sustainPedal = false;

        
        if ( Piano.MIDDLEC === undefined ) {
            Piano.loadSound();
        }

        var pianoObj = this;
        // add keys
        for ( let i = -40; i < 48; i++ ) {
            let note = document.createElement('div');
            piano.append(note);
            note.classList.add('key');

            // determine if it is black or white key by if it is in C Major scale
            if ( Piano.cMajorScale.indexOf((i+1200)%12) > -1 ) {
                note.classList.add('whitekey');
            } else {
                note.classList.add('blackkey');
            }

            // make playable
            note.addEventListener('mousedown', function () {
                pianoObj.playNote(i);
                document.onmouseup = function () {
                    pianoObj.releaseNote(i);
                }
            });

            // add label to middle C
            if (i == 0) {
                note.innerHTML = "C4";
                note.id = "middlec";
            }
        }
        // scroll to middle of piano
        piano.scrollLeft = document.getElementById('middlec').offsetLeft - 200;

        // add scrolling
        piano.addEventListener('mousewheel', function (event) {
            piano.scrollLeft += event.deltaY;
        });



    }

    /**
     * 
     * @param {int} distFromC4 - should be an integer number of half steps (can be negative) the note is from Middle C
     */
    playNote(distFromC4) {
        var source = this.audioContext.createBufferSource();
        var gainNode = this.audioContext.createGain();
        source.buffer = Piano.MIDDLEC;
        gainNode.connect(this.audioContext.destination);
        source.connect(gainNode);
        source.detune.value = 100*distFromC4;
        // find some way of keeping playback speed the same?
        // source.playbackRate.value = Math.exp(-(distFromC) * 1/12*Math.log(2));
        source.start(0);
        this.sources[distFromC4] = source;
        this.gainNodes[distFromC4] = gainNode;
    }

    /**
     * 
     * @param {int} distFromC4 - number of half steps (+ or -) from C4
     */
    releaseNote(distFromC4) {
        var gain = this.gainNodes[distFromC4];
        // exponentially decay volume when key is released
        var pianoObj = this;
        setInterval(function () {
            if (!pianoObj.sustainPedal) {
                gain.gain.value = gain.gain.value * 0.92;
            }
        }, 10);
    }


}
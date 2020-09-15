

var audios, videos, audioDirectoryPath, audioExtension, videoDirectoryPath, videoExtension, audiosDurations, videosDurations;

loadTV();


///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////


function loadTV () {

    let xhr = new XMLHttpRequest();
    xhr.open("GET", "data.json");
    xhr.responseType = "json";
    xhr.send();
    xhr.onload = function(){
        if (xhr.status != 200){ 
            alert("Error " + xhr.status + " : " + xhr.statusText);
        }else{ 
            let jsondata = xhr.response;
            audios = jsondata.audios;
            videos = jsondata.videos;
            audioDirectoryPath = jsondata.audioDirectoryPath;
            audioExtension = jsondata.audioExtension ;
            videoDirectoryPath = jsondata.videoDirectoryPath;
            videoExtension = jsondata.videoExtension; 
            audiosDurations = jsondata.audiosDurations; 
            videosDurations = jsondata.videosDurations;

            doHtml();
            audiovideo(
                audios, videos, audioDirectoryPath, 
                audioExtension, videoDirectoryPath, 
                videoExtension, audiosDurations, videosDurations );

        }
    };

}


///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////


function audiovideo (   audios, videos, audioDirectoryPath, 
                        audioExtension, videoDirectoryPath, 
                        videoExtension, audiosDurations, videosDurations ) {

    audios = scrambleArray(audios);
    videos = scrambleArray(videos);
    
    var audioseq, videoseq;
    var audioseqloaded=false, videoseqloaded=false;
    var arrayOfVideoPaths = makePaths(videos,videoDirectoryPath,videoExtension);
    var arrayOfAudioPaths = makePaths(audios,audioDirectoryPath,audioExtension);

    audioseq = buildSeq(arrayOfAudioPaths,audiosDurations);
    videoseq = buildSeq(arrayOfVideoPaths,videosDurations);

    function makePaths (arrayOfNames,directoryPath,extension){
        let myPaths=[];
        for (name of arrayOfNames){
            let item = directoryPath + name + "." + extension;
            myPaths.push(item); }
        return myPaths;
    }

    function buildSeq (arrayOfPaths, arrayOfDurations) {
        let myseq, mylength;
        if (arrayOfDurations != undefined) {
            myseq = [];
            mylength = (arrayOfPaths.length != arrayOfDurations.length) ? (arrayOfPaths.length * arrayOfDurations.length) : arrayOfPaths.length;
            for (let i = 0; i < mylength; i++) {
                let item = [ arrayOfPaths[i % arrayOfPaths.length], arrayOfDurations[i % arrayOfDurations.length] ];
                myseq.push(item); } } 
        else {
            myseq = arrayOfPaths }
        return myseq;
    }

    function isArrayOfArrayOfPairStringDuration (array) {
        let test = true;
        if (Array.isArray(array)) {
            for (let i = 0; i < array.length; i++) {
                let item = array[i];
                if (Array.isArray(array)) {
                item = ( typeof item[0] === 'string') && ( typeof item[1] === 'number');
                } else { 
                    item = false }
                test = test && item; } } else {
            test = false; }
        return test;
    }


    function scrambleArray (array) {

        let length=array.length;
        let scrambledIndex=[];
        let scrambled=[];

        function getRandomInt(max) {
            return Math.floor( Math.random() * Math.floor(max) ) ; }

        for(let i=0; i<length ; i++){
            let n = getRandomInt(length);
            while (scrambledIndex.includes(n)) { n = getRandomInt(length); }    
            scrambledIndex.push(n); }

        for(let i=0; i<length ; i++){
            scrambled.push(array[scrambledIndex[i]]); }

        return scrambled;
    }

    //===============================================================================

    function playVideoSequence (videoseq, loop) {

        let video=document.getElementById('myVideo');
        let myseq=videoseq;
        
        function playVideo (path, delay) {
            video.src=path;
            video.loop=true;
            video.controls=false;
            video.muted=true;
            video.load();
            setTimeout( function () {
                    video.play();
                    time = 0;
            },
            delay)
        }

        let i=0;
        let myvideopath, myvideoduration;
        let mydelayforloading=500;
        
        myvideopath=myseq[i][0];
        myvideoduration=myseq[i][1] * 1000;

        function randomduration () {
            myvideoduration = Math.random()*100+20.0;
            myvideoduration = myvideoduration * 1000;
        }

        //randomduration(); //option

        playVideo (myvideopath, mydelayforloading); 
        
        function playVideoSequence () {
            
                if ( time >= myvideoduration ) {
                    i++;
                    i = (loop) ? (i % myseq.length) : i;

                    if ((i >= 0) && (i < myseq.length )) {
                        video.pause();
                        myvideopath=myseq[i][0];
                        myvideoduration=myseq[i][1] * 1000;
                        //randomduration(); // option
                        playVideo (myvideopath, mydelayforloading);
                    } 
                    else  {
                        video.pause();
                        clearInterval(myClock);
                    }

                    time = 0;
                }

        }

        let time = 0;
        let timeelapsed = 0;
        let clockIntervalle = 20;

        let myClock = setInterval( function () {
                playVideoSequence();
                time += clockIntervalle;
                timeelapsed += clockIntervalle;
        }, clockIntervalle);   
    }


    //===============================================================================


    function playAudioSequence (audioseq, loop) {
        let audio, ch=0;
        let audio1=document.createElement('audio');
        let audio2=document.createElement('audio');
        let myseq=audioseq; 
        
        function fadeOut (audio) {        
            let ctrlVol = setInterval( function () {
                audio.volume = audio.volume * 0.9;
                if( audio.volume < 0.001) { 
                    audio.pause();
                    clearInterval(ctrlVol);
                };
            }, 20);
        }

        function switchChannel () {
            ch++;
            ch = ch % 2;
            audio = (ch==0) ? audio1 : audio2;
        }

        function putName (path){
            let name, mydiv, myHtml;
            name = path.split('/').pop().split('.');
            name.pop();
            name = name.join('.');
            name = name.split("-");

            if (name.includes("bag")) { 
                name = nomalizeBagName(name);
            }

            if (name.includes("thedeepend")) { 
                name = nomalizeDeepEndName(name);
            }

            function nomalizeBagName (name) { //name = "bag-serie-261.6255653006-40-1.8780348873784-12";
                let namenormalized=[];
                for (let i = 0; i < name.length; i++) {
                    if (i == 2 || i == 3 || i == 4) {
                        let item = name[i];
                        item = Math.round(item * 10) / 10.0;
                        item = item.toString().split(".");
                        if (item.length == 1) { item.push("0"); };
                        item = item.join(".");
                        namenormalized.push(item); } 
                    else { namenormalized.push(name[i]); } }
                 return namenormalized.join('-');
            }

            function nomalizeDeepEndName (name) { 
                name[0] = "The deep end #";
                return name.join('');
            }

            mydiv = document.getElementById('info');
            myHtml = '<br>'+'<div align="right">'+ name + '</div>';
            mydiv.innerHTML = myHtml;
        }

        function playAudio (path, delay) {
            audio.src=path; 
            audio.loop=true;
            audio.load();
            setTimeout( function () {
                audio.volume=0.8;
                audio.play();
                time = 0;
                putName(path);
            },
            delay)
        }

        let i=0;
        let myaudiopath, myaudioduration;
        let mydelayforloading=500;

        audio=audio1;
        myaudiopath=myseq[i][0];
        myaudioduration=myseq[i][1] * 1000;
        playAudio (myaudiopath, mydelayforloading); 

        function playAudioSequence () {

                if ( time >= myaudioduration ) {
                    i++;
                    i = (loop) ? (i % myseq.length) : i;
                    
                    if ((i >= 0) && (i < myseq.length )) {
                        fadeOut(audio);
                        switchChannel();
                        myaudiopath=myseq[i][0];
                        myaudioduration=myseq[i][1] * 1000;
                        playAudio (myaudiopath, mydelayforloading);
                    } 
                    else if (i >= myseq.length) {
                        fadeOut(audio);
                        clearInterval(myClock);
                    };

                    time = 0;
                }

                window.addEventListener('click',function () { 
                    time = myaudioduration; 
                });
        }

        let time = 0;
        let timeelapsed = 0;
        let clockIntervalle = 20;

        let myClock = setInterval( function () { 
                playAudioSequence();
                time += clockIntervalle;
                timeelapsed += clockIntervalle;
        }, clockIntervalle);    
    }


    //===============================================================================

    function loadVideo (arrayOfVideoPaths) {
        let video=document.createElement('video');
        let videoData=[];

        let time = 0;
        let clockIntervalle = 20;
        let myClock = setInterval( function () {
                videoDataLoaded();
                time += clockIntervalle;
        }, clockIntervalle); 

        let i=0;
        let delay=500;
        let lookingForVideoData = setInterval( function () {
                loadVideoData(arrayOfVideoPaths[i],delay);
                i++;
        }, delay + 500 );

        function loadVideoData (path,delay) {
                video.src=path; 
                video.load();
                setTimeout( function () {
                        videoData.push([path,video.duration]);
                },
                delay)
        }

        function videoDataLoaded () {
                if (videoData.length == arrayOfVideoPaths.length ) {                 
                        clearInterval(lookingForVideoData);
                        clearInterval(myClock); 
                        videoseq=videoData;
                        videoseqloaded =true;
                } 
        }   
    }

    //===============================================================================

    function loadAudio (arrayOfAudioPaths) {
        let audio=document.createElement('audio');
        let audioData=[];

        let time = 0;
        let clockIntervalle = 20;
        let myClock = setInterval( function () {
                audioDataLoaded();
                time += clockIntervalle;
        }, clockIntervalle);

        let i=0;
        let delay=500;
        let lookingForAudioData = setInterval( function () {
                loadAudioData(arrayOfAudioPaths[i],delay);
                i++;
        }, delay + 500 );

        function loadAudioData (path,delay) {
                audio.src=path;
                audio.load();
                setTimeout( function () {
                        audioData.push([path,audio.duration]);
                },
                delay)
        }

        function audioDataLoaded () {
                if (audioData.length == arrayOfAudioPaths.length ) {                 
                        clearInterval(lookingForAudioData);
                        clearInterval(myClock); 
                        audioseq=audioData;
                        audioseqloaded =true;
                }
        }
    }

    //===============================================================================

    function loadAndPlayVideoAndAudio () {
        let loop=true;

        if (isArrayOfArrayOfPairStringDuration(videoseq)) {
            videoseqloaded=true;
        } else {
            loadVideo(videoseq);
        }

        if (isArrayOfArrayOfPairStringDuration(audioseq)) {
            audioseqloaded =true;
        } else {
            loadAudio(audioseq);
        }

        function play () {
            playVideoSequence (videoseq, loop);
            playAudioSequence (audioseq, loop);
            }

        let ctrlDataLoaded = setInterval( function () {
            if( audioseqloaded && videoseqloaded ) { 
                let nclicks = 0;
                window.addEventListener('click',
                function () {
                    if (nclicks==0){
                        play();
                        nclicks++;
                    }
                });
                clearInterval(ctrlDataLoaded);
            };
        }, 20);
    }

    loadAndPlayVideoAndAudio();

}


//===============================================================================
    

function doHtml () {

    let presentation = "";
    let cadre = "";

    presentation = presentation + '<h1>NO SPEACH TV</h1>';
    presentation = presentation + '<div>© Digitaltonal, for loudspeakers</div>';
    presentation = presentation + '<div class="ui segment>';
    presentation = presentation + '<br><br><p><i>click to continue</i></p>';
    presentation = presentation + '</div>';

   
    cadre = cadre + '<div class="ui sizer vertical segment" style="font-size: 9px;">'
    cadre = cadre + '<div class="ui right floated huge header">NO SPEACH TV</div>';
    cadre = cadre + '<br></div></div>';


    let introdiv = document.getElementById('intro');
    let cadrediv = document.getElementById('cadre');

    introdiv.innerHTML = presentation;


    window.addEventListener('click', () => { 
        introdiv.innerHTML = ""; 
        cadrediv.innerHTML = cadre;
    });


}


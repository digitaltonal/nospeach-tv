~media_path = "/path/to/media";

~audio_names = List[];
~audio_path = ~media_path +/+ "audio";
PathName(~audio_path).filesDo{ arg path;
	~audio_names.add(path.fileNameWithoutExtension) };
~audio_names = ~audio_names.asArray.scramble;

//===========================================================

~video_names = List[];
~video_path = ~media_path +/+ "video";
PathName(~video_path).filesDo{ arg path;
	~video_names.add(path.fileNameWithoutExtension) };
~video_names = ~video_names.asArray.scramble;

~data = (
    audios: ~audio_names,
    videos: ~video_names,
    audioDirectoryPath:  "media/audio/",
    audioExtension: "mp3" ,
    videoDirectoryPath:  "media/video/",
    videoExtension:  "mp4" ,
    audiosDurations:  [120.0],
    videosDurations: [30.0]
);

~json = "";

i=0;
~data.keysValuesDo{ arg key,value;
	key = key.asString;
	~json = ~json ++ "%: %".format(key.cs,value.cs);
	~json = if(i<(~data.size-1)){~json ++ ",\n"}{~json ++ "\n"};
	i=i+1;
};

~json = "{\n%}".format(~json);
~jsonfile = File("data.json".resolveRelative,"w");~jsonfile.write(~json);~jsonfile.close;


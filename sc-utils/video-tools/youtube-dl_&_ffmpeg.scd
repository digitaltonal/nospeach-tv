

~path = "".resolveRelative;
~outpath = ~path +/+ "youtube-video"; File.mkdir(~outpath);
~youtupe_url = ~path +/+ "url.txt";
~extractpath = ~path +/+ "extract"; File.mkdir(~extractpath);

//bin path
~youtubedl_path = "/path/to/youtube-dl/bin/youtube-dl";
~ffmpeg_path = "/path/to/ffmpeg/bin/ffmpeg";

//=================================================================================================


~exe_youtubedlCmd = false;
~exe_ffmpegCmd = true;


//=================================================================================================


// 1. -- youtube-dl

//tag name
~id = true;
~title = false;

~make_youtubedlCmd_shell_file = false; //option

~youtubedl_cmd =  ~youtubedl_path + "-f mp4";
~youtubedl_cmd = ~youtubedl_cmd  + "-o '%".format(~outpath);
if (~title) { ~youtubedl_cmd = ~youtubedl_cmd ++ "/%(title)s.%(ext)s'" };
if (~id) { ~youtubedl_cmd = ~youtubedl_cmd ++ "/%(id)s.%(ext)s'" };
~youtubedl_cmd = ~youtubedl_cmd + "-a %".format(~youtupe_url);

if (~make_youtubedlCmd_shell_file) {
	~mycmdFile = File("ydl.sh".resolveRelative,"w") ;
	~mycmdFile.write("#!/bin/sh"); ~mycmdFile.write("\n\n\n"); ~mycmdFile.write(~youtubedl_cmd) };

~youtubedl_exe = {
	var p = Pipe.new(~youtubedl_cmd, "r");
	var l = p.getLine; while({l.notNil}, {l.postln; l = p.getLine; }); p.close;
};


/*==>*/ if (~exe_youtubedlCmd) {~youtubedl_cmd.postcs; ~youtubedl_exe.value};


//=================================================================================================


// 2. -- ffmpeg


~make_ffmpegCmd_shell_file = false; //option
~store_names = false; //option


~normalise_duration = { arg dur_string;
	var out = Array.newFrom(dur_string); out.pop; out.join
};


if(~make_ffmpegCmd_shell_file) {
	~mycmdFile = File("xtr.sh".resolveRelative,"w") ;
	~mycmdFile.write("#!/bin/sh"); ~mycmdFile.write("\n\n\n");
};

if(~store_names) {
	~nameFile = File("names.txt".resolveRelative,"w+")
};


PathName(~outpath).filesDo{arg path;

	~in = path.fullPath;
	~name = path.fileNameWithoutExtension;
	~n = 1;

	~n.do{ arg index;

		~newname = ~name ++ "-e";
		if (index>0) { ~newname = ~newname ++ index };
		if(~store_names) { ~nameFile.write(~newname); ~nameFile.write("\n") };

		~basename = ~newname ++ "." ++ path.extension;
		~out = ~extractpath +/+ ~basename;

		~debut = 30.rrand(59).asTimeString;
		~duree = 30.rrand(60*3).asTimeString;
		~debut = ~normalise_duration.(~debut);
		~duree = ~normalise_duration.(~duree);


		if(~make_ffmpegCmd_shell_file) {
			~ffmpegCmd = "ffmpeg -ss % -t % -i % %".format(~debut,~duree,~in,~out);
			~mycmdFile.write(~ffmpegCmd); ~mycmdFile.write("\n\n\n") };


		~ffmpegCmd_with_path = ~ffmpeg_path + "-ss % -t % -i % %".format(~debut,~duree,~in,~out);
		~ffmpeg_exe = {
			var p = Pipe.new(~ffmpegCmd_with_path, "r");
			var l = p.getLine;
			while({l.notNil}, {l.postln; l = p.getLine; }); p.close;
		};

		/*==>*/ if (~exe_ffmpegCmd) {~ffmpegCmd_with_path.postcs;~ffmpeg_exe.value};
	}
};


if (~make_ffmpegCmd_shell_file) { ~nameFile.close };
if (~store_names) { ~mycmdFile.close };



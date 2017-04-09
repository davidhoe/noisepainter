import * as $ from 'jquery'

// private singleton instance
var _TextFileLoaderInstance = null;

/**
 * Handles text file loading, handy for loading in external shader files
 */
export class TextFileLoader {
    constructor() {
        console.log("Creating TextFileLoader instance");
        this.allFileLoaders = {};
    }

    /**
     * load files
     */
    loadFiles(arrayOfPaths, doneCallback)
    {
        var filepath;
        var fileLoader;
        var fileLoaders = [];
        var _this = this;
        for(var i =0;i < arrayOfPaths.length;++i)
        {
            filepath = arrayOfPaths[i];
            if(this.allFileLoaders[filepath] == null)
            {
                console.log("file not loaded yet, so load it: " + filepath);
                fileLoader = $.get(filepath);
                this.allFileLoaders[filepath] = fileLoader;
            }
            else{
                console.log("file loaded already, using cached. " + filepath);
                fileLoader = this.allFileLoaders[filepath];
            }

            fileLoaders.push(fileLoader);
        }

        var all = $.when.apply($, fileLoaders);
        all.done(() => {_this._filesLoaded(arrayOfPaths, fileLoaders, doneCallback) } );
    }

    /**
     * load a file
     */
    loadFile(filepath, doneCallback)
    {
        this.loadFiles([filepath], doneCallback);

    }

    /**
     * Get the content of a loaded file.  Returns empty string if not found.
     */
    getFileContent(filepath)
    {
        if(this.allFileLoaders[filepath] != null)
        {
            return this.allFileLoaders[filepath].responseText;
        }
        return "";
    }

    //////////////////////////////////////////////////////////////////////////////
    //private methods

    _filesLoaded(filePaths, fileLoaders, doneCallback)
    {
        console.log("files loaded: " + filePaths);
        var fileContents = [];
        for (var i = 0; i < fileLoaders.length; ++i) {
            fileContents.push(fileLoaders[i].responseText);
        }
        if(doneCallback != null) doneCallback(fileContents);

    }

    //////////////////////////////////////////////////////////////////////////////
    // static methods

    static Instance() {
        //todo
        if(_TextFileLoaderInstance == null)
        {
            _TextFileLoaderInstance = new TextFileLoader();
        }
        return _TextFileLoaderInstance;
    }
}
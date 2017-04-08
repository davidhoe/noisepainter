/**
 * Created by jose.hillers on 08/06/2016.
 */
import {TextureLoader} from "three"
import FileLoader from "../file-loader/FileLoader"

export default class Preloader {
    load(handler) {
        FileLoader.load("./textures/texture-list.json", function () {
            var json = JSON.parse(this.responseText);
            var files = json.files;
            files = files.filter(item =>item.indexOf(".json") < 0);
            var totalFiles = files.length;
            var loadedFiles = 0;
            var loader = new TextureLoader();

            files.forEach(function (item) {
                loader.load(item, function () {
                    loadedFiles++;
                    if (loadedFiles >= totalFiles) {
                        handler();
                    }
                });
            });

        });
    };
}

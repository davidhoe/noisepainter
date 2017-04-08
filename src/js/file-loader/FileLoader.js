/**
 * Created by jose.hillers on 08/06/2016.
 */
export default class FileLoader {
    static load(url, handler) {
        var request = new XMLHttpRequest();
        request.addEventListener("load", handler);
        request.open("GET", url);
        request.send();
    }
};
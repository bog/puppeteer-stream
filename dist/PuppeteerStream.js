"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStream = exports.launch = exports.Stream = void 0;
const puppeteer_core_1 = __importDefault(require("puppeteer-core"));
const stream_1 = require("stream");
const path_1 = __importDefault(require("path"));
class Stream extends stream_1.Readable {
    constructor(page, options) {
        super(options);
        this.page = page;
    }
    _read() { }
    // @ts-ignore
    destroy() {
        const _super = Object.create(null, {
            destroy: { get: () => super.destroy }
        });
        return __awaiter(this, void 0, void 0, function* () {
            _super.destroy.call(this);
            // @ts-ignore
            yield this.page.browser().videoCaptureExtension.evaluate((index) => {
                // @ts-ignore
                STOP_RECORDING(index);
            }, 
            // @ts-ignore
            this.page._id);
        });
    }
}
exports.Stream = Stream;
function launch(arg1, opts) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        //if puppeteer library is not passed as first argument, then first argument is options
        if (typeof arg1.launch != "function") {
            opts = arg1;
        }
        if (!opts)
            opts = {};
        if (!opts.args)
            opts.args = [];
        if (!opts.ignoreDefaultArgs)
            opts.ignoreDefaultArgs = [];
        const extensionPath = path_1.default.join(__dirname, "..", "extension");
        const extensionId = "jjndjgheafjngoipoacpjgeicjeomjli";
        let loadExtension = false;
        let loadExtensionExcept = false;
        let whitelisted = false;
        opts.args = opts.args.map((x) => {
            if (x.includes("--load-extension=")) {
                loadExtension = true;
                return x + "," + extensionPath;
            }
            else if (x.includes("--disable-extensions-except=")) {
                loadExtensionExcept = true;
                return ("--disable-extensions-except=" + extensionPath + "," + x.split("=")[1]);
            }
            else if (x.includes("--whitelisted-extension-id")) {
                whitelisted = true;
                return x + "," + extensionId;
            }
            return x;
        });
        if (!loadExtension)
            opts.args.push("--load-extension=" + extensionPath);
        if (!loadExtensionExcept)
            opts.args.push("--disable-extensions-except=" + extensionPath);
        if (!whitelisted)
            opts.args.push("--whitelisted-extension-id=" + extensionId);
        if (((_a = opts.defaultViewport) === null || _a === void 0 ? void 0 : _a.width) && ((_b = opts.defaultViewport) === null || _b === void 0 ? void 0 : _b.height))
            opts.args.push(`--window-size=${(_c = opts.defaultViewport) === null || _c === void 0 ? void 0 : _c.width}x${(_d = opts.defaultViewport) === null || _d === void 0 ? void 0 : _d.height}`);
        if (opts.headless) {
            // chrome as a value loads the chrome browser environment
            // see: https://bugs.chromium.org/p/chromium/issues/detail?id=706008#c36
            opts.headless = 'chrome';
            // by default, headless mode mutes audio. disable that.
            if (Array.isArray(opts.ignoreDefaultArgs)) {
                opts.ignoreDefaultArgs.push('--mute-audio');
            }
        }
        let browser;
        if (typeof arg1.launch == "function") {
            browser = yield arg1.launch(opts);
        }
        else {
            browser = yield puppeteer_core_1.default.launch(opts);
        }
        // @ts-ignore
        browser.encoders = new Map();
        const extensionTarget = yield browser.waitForTarget(
        // @ts-ignore
        (target) => target.type() === "background_page" && target._targetInfo.title === "Video Capture");
        // @ts-ignore
        browser.videoCaptureExtension = yield extensionTarget.page();
        // @ts-ignore
        yield browser.videoCaptureExtension.exposeFunction("sendData", (opts) => {
            const data = Buffer.from(str2ab(opts.data));
            // @ts-ignore
            browser.encoders.get(opts.id).push(data);
        });
        return browser;
    });
}
exports.launch = launch;
function getStream(page, opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const encoder = new Stream(page);
        if (!opts.audio && !opts.video)
            throw new Error("At least audio or video must be true");
        if (!opts.mimeType) {
            if (opts.video)
                opts.mimeType = "video/webm";
            else if (opts.audio)
                opts.mimeType = "audio/webm";
        }
        if (!opts.frameSize)
            opts.frameSize = 20;
        yield page.bringToFront();
        // @ts-ignore
        yield page.browser().videoCaptureExtension.evaluate((settings) => {
            // @ts-ignore
            START_RECORDING(settings);
        }, Object.assign(Object.assign({}, opts), { index: page._id }));
        // @ts-ignore
        page.browser().encoders.set(page._id, encoder);
        return encoder;
    });
}
exports.getStream = getStream;
function str2ab(str) {
    // Convert a UTF-8 String to an ArrayBuffer
    var buf = new ArrayBuffer(str.length); // 1 byte for each char
    var bufView = new Uint8Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHVwcGV0ZWVyU3RyZWFtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL1B1cHBldGVlclN0cmVhbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSxvRUFNd0I7QUFDeEIsbUNBQW1EO0FBQ25ELGdEQUF3QjtBQUV4QixNQUFhLE1BQU8sU0FBUSxpQkFBUTtJQUNuQyxZQUFvQixJQUFVLEVBQUUsT0FBeUI7UUFDeEQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBREksU0FBSSxHQUFKLElBQUksQ0FBTTtJQUU5QixDQUFDO0lBRUQsS0FBSyxLQUFLLENBQUM7SUFFWCxhQUFhO0lBQ1AsT0FBTzs7Ozs7WUFDWixPQUFNLE9BQU8sWUFBRztZQUNoQixhQUFhO1lBQ2IsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLHFCQUFxQixDQUFDLFFBQVEsQ0FDdkQsQ0FBQyxLQUFhLEVBQUUsRUFBRTtnQkFDakIsYUFBYTtnQkFDYixjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDdkIsQ0FBQztZQUNELGFBQWE7WUFDYixJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FDYixDQUFDO1FBQ0gsQ0FBQztLQUFBO0NBQ0Q7QUFwQkQsd0JBb0JDO0FBU0QsU0FBc0IsTUFBTSxDQUMzQixJQUVNLEVBQ04sSUFBMkU7OztRQUUzRSxzRkFBc0Y7UUFDdEYsSUFBSSxPQUFPLElBQUksQ0FBQyxNQUFNLElBQUksVUFBVSxFQUFFO1lBQ3JDLElBQUksR0FBRyxJQUFJLENBQUM7U0FDWjtRQUVELElBQUksQ0FBQyxJQUFJO1lBQUUsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUVyQixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUk7WUFBRSxJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUUvQixJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQjtZQUFFLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxFQUFF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
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
            opts.ignoreDefaultArgs.push('--mute-audio');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHVwcGV0ZWVyU3RyZWFtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL1B1cHBldGVlclN0cmVhbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSxvRUFNd0I7QUFDeEIsbUNBQW1EO0FBQ25ELGdEQUF3QjtBQUV4QixNQUFhLE1BQU8sU0FBUSxpQkFBUTtJQUNuQyxZQUFvQixJQUFVLEVBQUUsT0FBeUI7UUFDeEQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBREksU0FBSSxHQUFKLElBQUksQ0FBTTtJQUU5QixDQUFDO0lBRUQsS0FBSyxLQUFJLENBQUM7SUFFSixPQUFPOzs7OztZQUNaLE9BQU0sT0FBTyxZQUFHO1lBQ2hCLGFBQWE7WUFDYixNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMscUJBQXFCLENBQUMsUUFBUSxDQUN2RCxDQUFDLEtBQWEsRUFBRSxFQUFFO2dCQUNqQixhQUFhO2dCQUNiLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN2QixDQUFDO1lBQ0QsYUFBYTtZQUNiLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUNiLENBQUM7UUFDSCxDQUFDO0tBQUE7Q0FDRDtBQW5CRCx3QkFtQkM7QUFTRCxTQUFzQixNQUFNLENBQzNCLElBRU0sRUFDTixJQUEyRTs7O1FBRTNFLHNGQUFzRjtRQUN0RixJQUFJLE9BQU8sSUFBSSxDQUFDLE1BQU0sSUFBSSxVQUFVLEVBQUU7WUFDckMsSUFBSSxHQUFHLElBQUksQ0FBQztTQUNaO1FBRUQsSUFBSSxDQUFDLElBQUk7WUFBRSxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBRXJCLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSTtZQUFFLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBRS9CLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCO1lBQUUsSUFBSSxDQUFDLGlCQUFpQixHQUFHLEVBQUUsQ0FBQztRQUV6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
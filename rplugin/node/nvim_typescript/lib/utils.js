"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
function trim(s) {
    return (s || '').replace(/^\s+|\s+$/g, '');
}
exports.trim = trim;
function convertToDisplayString(displayParts) {
    let ret = '';
    if (!displayParts)
        return ret;
    for (let dp of displayParts) {
        ret += dp['text'];
    }
    return ret;
}
exports.convertToDisplayString = convertToDisplayString;
function getParams(members, separator) {
    let ret = '';
    members.forEach((member, idx) => {
        if (idx === members.length - 1) {
            ret += member.text;
        }
        else {
            ret += member.text + separator;
        }
        return ret;
    });
}
exports.getParams = getParams;
function getCurrentImports(client, inspectedFile) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const documentSymbols = yield client.getDocumentSymbols({
                file: inspectedFile
            });
            if (documentSymbols.childItems) {
                return resolve(documentSymbols.childItems
                    .filter(item => item.kind === 'alias')
                    .map(item => item.text));
            }
            else {
                return reject();
            }
        }));
    });
}
exports.getCurrentImports = getCurrentImports;
function getImportCandidates(client, currentFile, cursorPosition) {
    return __awaiter(this, void 0, void 0, function* () {
        const cannotFindNameError = 2304;
        const args = {
            file: currentFile,
            startLine: cursorPosition.line,
            endLine: cursorPosition.line,
            startOffset: cursorPosition.col,
            endOffset: cursorPosition.col,
            errorCodes: [cannotFindNameError]
        };
        return yield client.getCodeFixesAtCursor(args);
    });
}
exports.getImportCandidates = getImportCandidates;
function convertEntry(nvim, entry) {
    return __awaiter(this, void 0, void 0, function* () {
        let kind = yield getKind(nvim, entry.kind);
        return {
            word: entry.name,
            kind: kind
        };
    });
}
exports.convertEntry = convertEntry;
function convertDetailEntry(nvim, entry) {
    return __awaiter(this, void 0, void 0, function* () {
        let displayParts = entry.displayParts;
        let signature = '';
        for (let p of displayParts) {
            signature += p.text;
        }
        signature = signature.replace(/\s+/gi, ' ');
        let menuText = signature.replace(/^(var|let|const|class|\(method\)|\(property\)|enum|namespace|function|import|interface|type)\s+/gi, '');
        // let documentation = menuText;
        let kind = yield getKind(nvim, entry.kind);
        return {
            word: entry.name,
            kind: entry.kind,
            menu: menuText
        };
    });
}
exports.convertDetailEntry = convertDetailEntry;
function getLocale(procEnv) {
    const lang = procEnv.LC_ALL || procEnv.LC_MESSAGES || procEnv.LANG || procEnv.LANGUAGE;
    return lang && lang.replace(/[.:].*/, '').replace(/[_:].*/, '');
}
exports.getLocale = getLocale;
function getKind(nvim, kind) {
    return __awaiter(this, void 0, void 0, function* () {
        const icons = yield nvim.getVar('nvim_typescript#kind_symbols');
        if (kind in icons)
            return icons[kind];
        return kind;
    });
}
exports.getKind = getKind;
function toTitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}
function createLocList(nvim, list, title, autoOpen = true) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            yield nvim.call('setloclist', [0, list, 'r', title]);
            if (autoOpen) {
                yield nvim.command('lwindow');
            }
            resolve();
        }));
    });
}
exports.createLocList = createLocList;
exports.guid = () => Math.floor((1 + Math.random()) * 0x10000);
function printEllipsis(nvim, message) {
    return __awaiter(this, void 0, void 0, function* () {
        /**
         * Print as much of msg as possible without triggering "Press Enter"
         * Inspired by neomake, which is in turn inspired by syntastic.
         */
        const columns = yield nvim.getOption('columns');
        let msg = message.replace('\n', '. ');
        if (msg.length > columns - 12) {
            msg = msg.substring(0, columns - 15) + '...';
        }
        yield nvim.command(`echo "${msg}"`);
    });
}
exports.printEllipsis = printEllipsis;

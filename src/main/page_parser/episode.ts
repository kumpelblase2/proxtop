import cheerio from "cheerio";
import * as Promise from "bluebird";

export type EpisodeInfo = {
    name: string,
    sub: string,
    episode: number,
    streams?: Array<StreamInfo>,
    prev?: string,
    next?: string
}

export type StreamInfo = {
    id: string,
    code: string,
    type: string,
    htype: string,
    name: string,
    replace: string,
    img: string,
    parts: string,
    ssl: string,
    text: string,
    legal: string,
    uploader: string,
    username: string,
    tid?: any,
    tname?: any
}

export function parseInfo($): EpisodeInfo {
    return {
        name: $('.wName').first().text(),
        sub: $('.wLanguage').first().text().toLowerCase(),
        episode: parseInt($('.wEp').first().text())
    }
}

export function parseMirrors(main): Array<StreamInfo> {
    const text = main.html();
    const match = /streams ?= ?(\[.*\]);/.exec(text);
    return JSON.parse(match[1]);
}

type NextPrevLinks = {
    next: string,
    prev: string
}

export function parseEpisode(page): Promise<EpisodeInfo> {
    return Promise.resolve(page).then(cheerio.load)
        .then(($) => {
            const info = parseInfo($);
            //@ts-ignore
            info.streams = parseMirrors($('#main'));
            //@ts-ignore
            const navEps = parseNextPrevious($('.no_details').first());
            info.prev = navEps.prev;
            info.next = navEps.next;
            return info;
        });
}

export function parseNextPrevious(row): NextPrevLinks {
    const firstColumn = row.children().first();
    let next = null;
    let prev = null;
    const epRegex = /\/watch\/\d+\/(\d+)\/.+/;
    if(firstColumn.children().length == 1) {
        const first = firstColumn.children().first();
        prev = epRegex.exec(first.attr('href'))[1];
    }

    const nextButton = row.children().next().next().children().first();
    if(/.+>.+/.test(nextButton.text())) {
        next = epRegex.exec(nextButton.attr('href'))[1];
    }

    return {
        prev: prev,
        next: next
    };
}

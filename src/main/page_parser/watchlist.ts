import cheerio from "cheerio";

type EntryName = {
    name: string,
    id: number,
    url: string
}

type WatchlistEntry = {
    airing: boolean,
    name: string,
    id: number,
    url: string,
    episode: number,
    sub: string,
    status: boolean,
    entry: number
}

type WatchlistType = 'anime' | 'manga'

type EntriesForType = {
    type: WatchlistType,
    contents: WatchlistEntry[]
}

function parseAiringColumn(column): boolean {
    return column.children('img').attr('title') === 'Airing';
}

function parseNameColumn(column): EntryName {
    const content = column.children('a');
    return {
        name: content.text(),
        id: parseInt(content.attr('title').split(':')[1], 10),
        url: content.attr('href')
    };
}

function parseEpisodeColumn(column): number {
    return parseInt(column.text());
}

function parseSubColumn(column): string {
    return column.text().toLowerCase();
}

function parseStatusColumn(column): boolean {
    return /online/.test(column.children('img').attr('src'));
}

function parseEntryId(row): number {
    return parseInt(row.attr('id').substr(5));
}

function extractFromTable($, table): EntriesForType {
    const result = {
        type: null,
        contents: []
    };
    const title = table.parent().children().first().text();
    if(title.indexOf('Anime') >= 0) {
        result.type = 'anime';
    } else if(title.indexOf('Manga') >= 0) {
        result.type = 'manga';
    } else {
        return null;
    }

    table.find('tr').each((i, row) => {
        if($(row).attr('id') == null) {
            return;
        }

        result.contents.push(parseRow($(row)));
    });

    return result;
}

function parseRow(row): WatchlistEntry {
    let current = row.children().first();
    let airing = parseAiringColumn(current);
    current = current.next();
    const name = parseNameColumn(current);
    current = current.next();
    let episode = parseEpisodeColumn(current);
    current = current.next();
    let sub = parseSubColumn(current);
    current = current.next().next();
    let status = parseStatusColumn(current);
    let entry = parseEntryId(row);
    return {
        airing,
        id: name.id,
        url: name.url,
        name: name.name,
        episode,
        sub,
        status,
        entry
    };
}

export default function parseWatchlist(page): Promise<Watchlist> {
    return Promise.resolve(page).then(cheerio.load).then(($) => {
        const tables = $('table#box-table-a');
        const data: Watchlist = { anime: [], manga: [] };
        tables.each((i, elem) => {
            const result = extractFromTable($, $(elem));
            if(result) {
                data[result.type] = result.contents;
            }
        });

        data.anime = data.anime || [];
        data.manga = data.manga || [];

        return data;
    });
}

export type Watchlist = {
    anime: WatchlistEntry[],
    manga: WatchlistEntry[]
}

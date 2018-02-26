import { promisifyAll } from "bluebird";
import * as semver from "semver";
import { Stats } from "fs";

const fs = promisifyAll(require('fs'));

export function createIfNotExists(inPath: string): Promise<Stats> {
    return fs.statAsync(inPath).catch(() => {
        return fs.openAsync(inPath, 'w').then(fs.closeAsync);
    });
}

export function createDirIfNotExists(path: string) {
    try {
        fs.mkdirSync(path);
    } catch(e) {
        if(e.code != 'EEXIST') {
            throw e;
        }
    }
}

export function capitalizeFirstLetter(word: string) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

export interface OnlineEntry {
    id: string,
    status: string
}

export function getOnlineDiff<T extends OnlineEntry>(oldEntries: Array<T>, newEntries: Array<T>): Array<T> {
    return newEntries.filter((entry) => {
        const oldEntry = oldEntries.find(obj => obj.id === entry.id);
        if(oldEntry) {
            return entry.status && !oldEntry.status;
        } else {
            return false;
        }
    });
}

export function findLatestRelease(releases, current: string | null) {
    releases.filter(release => !release.prerelease && !release.draft);
    const actual = releases.filter(release => !release.prerelease && !release.draft);
    const newerVersions = actual.filter(release => {
        if(current) {
            return semver.gt(release.tag_name, current);
        } else {
            return true;
        }
    });
    if(newerVersions.length === 0) {
        return null;
    }

    newerVersions.sort((a, b) => new Date(a.published_at).getTime() - new Date(b.published_at).getTime()).reverse();

    return newerVersions[0];
}

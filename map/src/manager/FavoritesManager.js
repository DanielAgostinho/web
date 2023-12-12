import MarkerOptions, { getSvgBackground } from '../map/markers/MarkerOptions';
import Utils from '../util/Utils';
import _ from 'lodash';
import { apiPost } from '../util/HttpApi';
import { quickNaNfix } from '../util/Utils';
import TracksManager from './track/TracksManager';
import { refreshGlobalFiles } from './track/SaveTrackManager';
import { OBJECT_TYPE_FAVORITE } from '../context/AppContext';

export const FAVORITE_FILE_TYPE = 'FAVOURITES';
export const DEFAULT_FAV_GROUP_NAME = 'favorites';
const DEFAULT_TAB_ICONS = 'used';
const FAVORITE_GROUP_FOLDER = '/map/images/poi_categories';
const DEFAULT_GROUP_WPT_COLOR = '#eecc22';
const FAV_FILE_PREFIX = 'favorites-';
export const LOCATION_UNAVAILABLE = 'loc_unavailable';
export const DEFAULT_GROUP_NAME_POINTS_GROUPS = '';
export const SUBFOLDER_PLACEHOLDER = '_%_';
const FAVORITE_LOCAL_STORAGE = 'visibleFav';
const colors = [
    '#10c0f0',
    '#1010a0',
    '#eecc22',
    '#88e030',
    '#eeee10',
    '#00842b',
    '#ff5020',
    '#8e2512',
    '#e044bb',
    '#000001',
    '#d00d0d',
    '#a71de1',
];
const shapes = [
    MarkerOptions.BACKGROUND_WPT_SHAPE_CIRCLE,
    MarkerOptions.BACKGROUND_WPT_SHAPE_OCTAGON,
    MarkerOptions.BACKGROUND_WPT_SHAPE_SQUARE,
];

function GroupResult(clienttimems, updatetimems, data) {
    this.clienttimems = clienttimems;
    this.updatetimems = updatetimems;
    this.data = data;
}

function getShapesSvg(color) {
    let res = {};
    shapes.forEach((shape) => {
        res[shape] = getSvgBackground(color, shape);
    });
    return res;
}

async function addFavorite(data, fileName, updatetime) {
    fileName = getGroupNameForFile(fileName);
    let resp = await apiPost(`${process.env.REACT_APP_USER_API_SITE}/mapapi/fav/add`, data, {
        params: {
            fileName: fileName,
            updatetime: updatetime,
        },
    });
    if (resp.data) {
        let data = prepareTrackData(resp.data.details.trackData);
        return new GroupResult(resp.data.clienttime, resp.data.updatetime, data);
    }
}

async function deleteFavorite(data, fileName, updatetime) {
    fileName = getGroupNameForFile(fileName);
    let resp = await apiPost(`${process.env.REACT_APP_USER_API_SITE}/mapapi/fav/delete`, data, {
        params: {
            fileName: fileName,
            updatetime: updatetime,
        },
    });
    if (resp.data) {
        let data = prepareTrackData(resp.data.details.trackData);
        return new GroupResult(resp.data.clienttime, resp.data.updatetime, data);
    }
}

async function updateFavorite(data, wptName, oldGroupName, newGroupName, oldGroupUpdatetime, newGroupUpdatetime, ind) {
    oldGroupName = getGroupNameForFile(oldGroupName);
    newGroupName = getGroupNameForFile(newGroupName);
    let resp = await apiPost(`${process.env.REACT_APP_USER_API_SITE}/mapapi/fav/update`, data, {
        params: {
            wptName: wptName,
            oldGroupName: oldGroupName,
            newGroupName: newGroupName,
            oldGroupUpdatetime: oldGroupUpdatetime,
            newGroupUpdatetime: newGroupUpdatetime,
            ind: ind,
        },
    });
    if (resp.data) {
        let newGroupResp = null;
        let oldGroupResp = null;
        let newGroup = resp.data.respNewGroup;
        let oldGroup = resp.data.respOldGroup;
        if (newGroup) {
            let data = prepareTrackData(newGroup.details.trackData);
            newGroupResp = new GroupResult(newGroup.clienttime, newGroup.updatetime, data);
        }
        if (oldGroup && oldGroup !== '') {
            let data = prepareTrackData(oldGroup.details.trackData);
            oldGroupResp = new GroupResult(oldGroup.clienttime, oldGroup.updatetime, data);
        }

        return {
            newGroupResp: newGroupResp,
            oldGroupResp: oldGroupResp,
        };
    }
}

function prepareTrackData(data) {
    if (data) {
        if (typeof data === 'string') {
            return JSON.parse(quickNaNfix(data));
        } else {
            return data;
        }
    }
}

function orderList(items, defaultItem) {
    let list = [];
    let hiddenList = [];
    items &&
        items.forEach((i) => {
            if (i.name === defaultItem) {
                list.unshift(i);
            } else if (i.hidden) {
                hiddenList.push(i);
            } else {
                list.push(i);
            }
        });
    return list.concat(hiddenList);
}

function getColorGroup(ctx, groupName, wpt) {
    let color;
    if (groupName === DEFAULT_FAV_GROUP_NAME) {
        groupName = DEFAULT_GROUP_NAME_POINTS_GROUPS;
    }
    if (wpt) {
        const currentGroup =
            ctx.selectedGpxFile?.pointsGroups &&
            !_.isEmpty(ctx.selectedGpxFile?.pointsGroups) &&
            ctx.selectedGpxFile.pointsGroups[groupName];
        if (currentGroup) {
            color = currentGroup.color;
        }
    } else {
        const currentGroup = ctx.favorites.groups.find((g) => g.name === groupName);
        if (currentGroup && currentGroup.pointsGroups[groupName]) {
            color = currentGroup.pointsGroups[groupName].color;
        }
    }
    if (color) {
        return Utils.hexToArgb(color);
    }
}

function createGroup(file) {
    file.preparedName = getGroupNameFromFile(file.name);
    file.folder = prepareFavGroupName(file.preparedName);
    let pointsGroups = FavoritesManager.prepareTrackData(file.details.pointGroups);
    const groupName = file.folder === DEFAULT_FAV_GROUP_NAME ? DEFAULT_GROUP_NAME_POINTS_GROUPS : file.folder;

    return {
        name: file.folder,
        updatetimems: file.updatetimems,
        file: file,
        pointsGroups: pointsGroups,
        hidden:
            pointsGroups[groupName].hidden !== undefined
                ? pointsGroups[groupName].hidden
                : isHidden(pointsGroups, groupName),
    };
}

export function getGroupNameForFile(groupName) {
    if (groupName.includes('/')) {
        return groupName.replace(/\//g, SUBFOLDER_PLACEHOLDER);
    }
    return groupName;
}

export function getGroupNameFromFile(fileName) {
    if (fileName.includes(SUBFOLDER_PLACEHOLDER)) {
        return fileName.replace(new RegExp(SUBFOLDER_PLACEHOLDER, 'g'), '/');
    }
    return fileName;
}

export function prepareFavGroupName(name) {
    return name.replace(new RegExp(`^${FavoritesManager.FAV_FILE_PREFIX}`), '').replace(/\.gpx$/, '');
}

export async function saveFavoriteGroup(data, groupName, ctx) {
    if (data.pointsGroups[groupName]) {
        groupName = getGroupNameForFile(groupName);
        let resp = await apiPost(`${process.env.REACT_APP_USER_API_SITE}/mapapi/fav/add-group`, data, {
            params: {
                groupName: groupName,
            },
        });
        if (resp.data) {
            const res = resp.data;
            refreshGlobalFiles(ctx, groupName, OBJECT_TYPE_FAVORITE).then();
            return FavoritesManager.createGroup(res);
        }
    }
}

export function createFavGroupFreeName(name, groups) {
    let occupied = null;
    let newName = name;
    for (let i = 1; i < 100; i++) {
        if (groups) {
            occupied = isFavGroupExists(newName, groups);
        }
        if (!occupied) {
            return newName;
        }
        newName = name + ' - ' + i; // try with "Track - X"
    }

    if (occupied) {
        throw new Error('FavoritesManager addTrack() too many same-tracks');
    }
    return newName;
}

export function isFavGroupExists(name, groups) {
    return groups.some((g) => g.name === name);
}

function isHidden(pointsGroups, name) {
    let group = pointsGroups[name];
    if (group && group.points) {
        for (let point of group.points) {
            if (point.ext.extensions.hidden === 'true') {
                return true;
            }
        }
    }
    return false;
}

function createDefaultWptGroup(wptGroup) {
    if (!wptGroup) {
        return {
            name: FavoritesManager.DEFAULT_GROUP_NAME,
        };
    } else {
        return wptGroup;
    }
}

function getGroupSize(group) {
    const name = group.name === DEFAULT_FAV_GROUP_NAME ? DEFAULT_GROUP_NAME_POINTS_GROUPS : group.name;
    if (group?.pointsGroups[name]?.groupSize) {
        return Number(group?.pointsGroups[name].groupSize);
    } else {
        const wpts = group?.pointsGroups[name]?.points;
        if (wpts) {
            return wpts.length > 0 ? wpts.length : 0;
        }
        return 0;
    }
}

export function removeShadowFromIconWpt(svgHtml) {
    const filterPattern = /filter=".*?"/g;
    return svgHtml.replace(filterPattern, '');
}

function replacePathData(pathData, shapeSize, oldShapeSize) {
    // ex. oldShapeSize = 24 and old path = d="M1 7L7 1H17L23 7V17L17 23H7L1 17V7Z"
    // for shapeSize = 30 new path = d="M1 9L9 1H21L29 9V21L21 29H9L1 21V9Z"
    const values = pathData.match(/[-+]?\d*\.?\d+/g);

    if (values && values.length === 14) {
        const scaleFactor = shapeSize / oldShapeSize;
        const newValues = values.map((value) => {
            const shiftedValue = parseFloat(value) * scaleFactor;
            return Math.round(shiftedValue);
        });

        return `M${newValues[0]} ${newValues[1]}L${newValues[2]} ${newValues[3]}H${newValues[4]}L${newValues[5]} ${newValues[6]}V${newValues[7]}L${newValues[8]} ${newValues[9]}H${newValues[10]}L${newValues[11]} ${newValues[12]}V${newValues[13]}Z`;
    }

    return pathData;
}

export function changeIconSizeWpt(svgHtml, iconSize, shapeSize) {
    // Update the sizes inside viewBox and for <image>, <circle>, <path>, <rect>

    const viewBoxPattern = /viewBox="0 0 (\d+) (\d+)"/;
    const widthPattern = /width="(\d+)"/;
    const heightPattern = /height="(\d+)"/;
    const circlePattern = /<circle ([^>]*)cx="(\d+\.?\d*)" ([^>]*)cy="(\d+\.?\d*)" ([^>]*)r="(\d+\.?\d*)" ([^>]*)\/>/;
    const pathPattern = /<path\s[^>]*d="([^"]+)"[^>]*>/g;
    const rectPattern =
        /<rect ([^>]*)width="(\d+\.?\d*)" ([^>]*)height="(\d+\.?\d*)" ([^>]*)rx="(\d+\.?\d*)" ([^>]*)\/>/;
    const imagePattern =
        /<image ([^>]*)x="(\d+\.?\d*)" ([^>]*)y="(\d+\.?\d*)" ([^>]*)width="(\d+\.?\d*)" ([^>]*)height="(\d+\.?\d*)" ([^>]*)href="([^"]*)" ([^>]*)\/>/;

    const viewBoxMatch = svgHtml.match(viewBoxPattern);
    const oldShapeSize = viewBoxMatch ? parseFloat(viewBoxMatch[1]) : shapeSize;

    svgHtml = svgHtml.replace(viewBoxPattern, () => {
        // Update the sizes inside viewBox
        const newWidth = shapeSize;
        const newHeight = shapeSize;
        return `viewBox="0 0 ${newWidth} ${newHeight}"`;
    });

    svgHtml = svgHtml.replace(widthPattern, () => {
        // Update width
        return `width="${shapeSize}"`;
    });

    svgHtml = svgHtml.replace(heightPattern, () => {
        // Update height
        return `height="${shapeSize}"`;
    });

    svgHtml = svgHtml.replace(circlePattern, (match, prefix, cx, middle, cy, middle2, r, suffix) => {
        // Update the sizes inside <circle>
        const newCx = shapeSize / 2;
        const newCy = shapeSize / 2;
        const newR = shapeSize / 2;
        return `<circle ${prefix}cx="${newCx}" ${middle}cy="${newCy}" ${middle2}r="${newR}" ${suffix}/>`;
    });

    svgHtml = svgHtml.replace(pathPattern, (match, pathData) => {
        // Update the sizes inside <path>
        const newPathData = replacePathData(pathData, shapeSize, oldShapeSize);
        const fillPattern = /fill="([^"]*)"/;
        const oldFillMatch = match.match(fillPattern);
        const oldFill = oldFillMatch ? oldFillMatch[1] : '';
        return `<path d="${newPathData}" fill="${oldFill}"/>`;
    });

    svgHtml = svgHtml.replace(rectPattern, (match, prefix, width, middle, height, middle2, rx, suffix) => {
        // Update the sizes inside <rect>
        const newWidth = shapeSize;
        const newHeight = shapeSize;
        const newRx = newWidth / 8;
        return `<rect ${prefix} width="${newWidth}" ${middle} height="${newHeight}" ${middle2} rx="${newRx}" ${suffix}/>`;
    });

    svgHtml = svgHtml.replace(
        imagePattern,
        (match, prefix, x, middle, y, middle2, width, middle3, height, middle4, href, suffix) => {
            const newSize = iconSize;
            const offsetX = (shapeSize - newSize) / 2;
            const offsetY = (shapeSize - newSize) / 2;
            const transform = `translate(${offsetX},${offsetY})`;
            return `<image ${prefix} transform="${transform}" ${middle2} width="${newSize}" ${middle3} height="${newSize}" ${middle4} href="${href}" ${suffix}/>`;
        }
    );

    return svgHtml;
}

export function updateFavGroups(listFiles, ctx) {
    if (!_.isEmpty(listFiles)) {
        let files = TracksManager.getFavoriteGroups(listFiles);
        let newFavoritesFiles = {
            groups: [],
        };
        files.forEach((file) => {
            let group = FavoritesManager.createGroup(file);
            newFavoritesFiles.groups.push(group);
        });
        newFavoritesFiles.groups = FavoritesManager.orderList(
            newFavoritesFiles.groups,
            FavoritesManager.DEFAULT_GROUP_NAME
        );
        ctx.setFavorites(newFavoritesFiles);
    } else {
        ctx.setFavorites([]);
    }
}

export function isNoValue(value) {
    return value === undefined || value === 'null' || value === null;
}

export function prepareColor(value) {
    return isNoValue(value) ? MarkerOptions.DEFAULT_WPT_COLOR : value;
}

export function prepareBackground(value) {
    return isNoValue(value) ? MarkerOptions.BACKGROUND_WPT_SHAPE_CIRCLE : value;
}

export function prepareIcon(value) {
    return isNoValue(value) ? MarkerOptions.DEFAULT_WPT_ICON : value;
}

const FavoritesManager = {
    addFavorite,
    deleteFavorite,
    updateFavorite,
    prepareTrackData,
    getShapesSvg,
    orderList,
    getColorGroup,
    createGroup,
    createDefaultWptGroup,
    getGroupSize,
    DEFAULT_TAB_ICONS: DEFAULT_TAB_ICONS,
    FAVORITE_GROUP_FOLDER: FAVORITE_GROUP_FOLDER,
    DEFAULT_GROUP_NAME: DEFAULT_FAV_GROUP_NAME,
    DEFAULT_GROUP_WPT_COLOR: DEFAULT_GROUP_WPT_COLOR,
    FAVORITE_FILE_TYPE: FAVORITE_FILE_TYPE,
    FAV_FILE_PREFIX: FAV_FILE_PREFIX,
    DEFAULT_GROUP_NAME_POINTS_GROUPS: DEFAULT_GROUP_NAME_POINTS_GROUPS,
    FAVORITE_LOCAL_STORAGE: FAVORITE_LOCAL_STORAGE,
    colors: colors,
    shapes: shapes,
};

export default FavoritesManager;

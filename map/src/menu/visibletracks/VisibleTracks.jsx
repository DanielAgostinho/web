import { AppBar, Box, Divider, IconButton, MenuItem, Toolbar, Typography } from '@mui/material';
import React, { useContext, useMemo } from 'react';
import visibleStyles from './visibletracks.module.css';
import headerStyles from '../trackfavmenu.module.css';
import AppContext from '../../context/AppContext';
import { ReactComponent as CloseIcon } from '../../assets/icons/ic_action_close.svg';
import CloudTrackItem from '../tracks/CloudTrackItem';
import { useWindowSize } from '../../util/hooks/useWindowSize';
import EmptyVisible from '../errors/EmptyVisible';
import { isEmpty } from 'lodash';
import TracksManager, { DEFAULT_GROUP_NAME } from '../../manager/track/TracksManager';
import Empty from '../errors/Empty';
import { Button } from '@mui/material/';
import { deleteTracksFromMap } from '../../manager/track/DeleteTrackManager';

export function getCountVisibleTracks(visibleTracks) {
    const oldSize = visibleTracks?.old?.length || 0;
    const newSize = visibleTracks?.new?.length || 0;
    return oldSize + newSize;
}

export function updateVisibleCache({ visible, file }) {
    let savedVisible = JSON.parse(localStorage.getItem(TracksManager.TRACK_VISIBLE_FLAG));
    if (savedVisible && !savedVisible.open) {
        savedVisible.open = [];
    }
    if (visible) {
        savedVisible.open.push(file.name);
    } else {
        const ind = savedVisible.open.findIndex((n) => n === file.name);
        if (ind !== -1) {
            savedVisible.open.splice(ind, 1);
        }
    }
    localStorage.setItem(TracksManager.TRACK_VISIBLE_FLAG, JSON.stringify(savedVisible));
}

export function hideAllVisTracks() {
    let savedVisible = JSON.parse(localStorage.getItem(TracksManager.TRACK_VISIBLE_FLAG));
    if (savedVisible) {
        savedVisible.open = [];
    }
    localStorage.setItem(TracksManager.TRACK_VISIBLE_FLAG, JSON.stringify(savedVisible));
}

export function removeAllDisableVisTracks(ctx) {
    if (!isEmpty(ctx.visibleTracks)) {
        let savedVisible = JSON.parse(localStorage.getItem(TracksManager.TRACK_VISIBLE_FLAG));
        if (savedVisible.open) {
            let newVisFiles = {
                old: [],
                new: [],
            };

            let newVisFilesNames = {
                old: [],
                new: [],
                open: [],
            };

            ctx.visibleTracks.new?.forEach((t) => {
                if (savedVisible.open.includes(t.name)) {
                    newVisFiles.new.push(t);
                    newVisFilesNames.new.push(t.name);
                    newVisFilesNames.open.push(t.name);
                }
            });
            newVisFilesNames.old = newVisFilesNames.new.concat(newVisFilesNames.old);
            newVisFiles.old = newVisFiles.new.concat(newVisFiles.old);
            newVisFilesNames.new = [];
            newVisFiles.new = [];
            ctx.visibleTracks.old?.forEach((t) => {
                if (savedVisible.open?.includes(t.name)) {
                    newVisFiles.old.push(t);
                    newVisFilesNames.old.push(t.name);
                    newVisFilesNames.open.push(t.name);
                }
            });
            localStorage.setItem(TracksManager.TRACK_VISIBLE_FLAG, JSON.stringify(newVisFilesNames));
            ctx.setVisibleTracks({ ...newVisFiles });
        }
    }
}

export default function VisibleTracks({ setOpenVisibleMenu, setMenuInfo = null, setSelectedType }) {
    const ctx = useContext(AppContext);

    const [, height] = useWindowSize();

    const trackItems = useMemo(() => {
        const items = [];
        ctx.visibleTracks?.new?.map((file, index) => {
            const isLastItem = !isEmpty(ctx.visibleTracks?.new) ? index === ctx.visibleTracks?.new.length - 1 : false;
            if (file.filesize !== 0) {
                items.push(
                    <CloudTrackItem
                        key={'visible-cloudtrack-' + file.name}
                        file={file}
                        visible={true}
                        isLastItem={isLastItem}
                    />
                );
            }
        });
        return items;
    }, [ctx.visibleTracks?.new]);

    const trackItemsOld = useMemo(() => {
        const items = [];
        ctx.visibleTracks?.old.map((file, index) => {
            const isLastItem = !isEmpty(ctx.visibleTracks?.old) ? index === ctx.visibleTracks?.old.length - 1 : false;
            if (file.filesize !== 0) {
                items.push(
                    <CloudTrackItem
                        key={'visible-cloudtrack-' + file.name}
                        file={file}
                        visible={true}
                        isLastItem={isLastItem}
                    />
                );
            }
        });
        return items;
    }, [ctx.visibleTracks?.old]);

    function hasVisibleTracks() {
        return !isEmpty(ctx.visibleTracks?.old) || !isEmpty(ctx.visibleTracks?.new);
    }

    function hasTracks() {
        if (!isEmpty(ctx.listFiles)) {
            return ctx.listFiles.uniqueFiles.some((f) => f.type === 'GPX');
        }
        return false;
    }

    function hideAllTracks() {
        if (!isEmpty(ctx.visibleTracks)) {
            let files = getAllVisibleFiles();
            if (files.length > 0) {
                deleteTracksFromMap(ctx, files);
            }
        }
    }

    function allVisibleTracksHidden() {
        let files = getAllVisibleFiles();
        if (files.length > 0) {
            return !files.some((f) => ctx.gpxFiles[f.name]?.url !== null && f.showOnMap);
        }
        return true;
    }

    function getAllVisibleFiles() {
        let files = [];
        if (!isEmpty(ctx.visibleTracks)) {
            if (!isEmpty(ctx.visibleTracks.old)) {
                files = files.concat(ctx.visibleTracks.old);
            }
            if (!isEmpty(ctx.visibleTracks.new)) {
                files = files.concat(ctx.visibleTracks.new);
            }
        }
        return files;
    }

    return (
        <>
            <Box minWidth={ctx.infoBlockWidth} maxWidth={ctx.infoBlockWidth} sx={{ overflow: 'hidden' }}>
                <AppBar position="static" className={headerStyles.appbar}>
                    <Toolbar className={headerStyles.toolbar}>
                        <IconButton
                            variant="contained"
                            type="button"
                            className={headerStyles.appBarIcon}
                            onClick={() => setOpenVisibleMenu(false)}
                        >
                            <CloseIcon />
                        </IconButton>
                        <Typography id="se-visible-cloud-track-name" component="div" className={headerStyles.title}>
                            Tracks
                        </Typography>
                        <Button
                            className={visibleStyles.button}
                            onClick={hideAllTracks}
                            disabled={allVisibleTracksHidden()}
                        >
                            Hide all
                        </Button>
                    </Toolbar>
                </AppBar>
                {isEmpty(ctx.visibleTracks?.new) && hasTracks() && (
                    <EmptyVisible
                        setMenuInfo={setMenuInfo}
                        setOpenVisibleMenu={setOpenVisibleMenu}
                        setSelectedType={setSelectedType}
                    />
                )}
                {hasVisibleTracks() && (
                    <>
                        <Box
                            minWidth={ctx.infoBlockWidth}
                            maxWidth={ctx.infoBlockWidth}
                            sx={{ overflowX: 'hidden', overflowY: 'auto !important', maxHeight: `${height - 120}px` }}
                        >
                            {trackItems}
                        </Box>
                        {trackItemsOld.length > 0 && (
                            <>
                                <Divider />
                                <MenuItem className={visibleStyles.item}>
                                    <Typography className={visibleStyles.title} noWrap>
                                        Recently visible
                                    </Typography>
                                </MenuItem>
                                <Box
                                    minWidth={ctx.infoBlockWidth}
                                    maxWidth={ctx.infoBlockWidth}
                                    sx={{
                                        overflowX: 'hidden',
                                        overflowY: 'auto !important',
                                        maxHeight: `${height - 120}px`,
                                    }}
                                >
                                    {trackItemsOld}
                                </Box>
                            </>
                        )}
                    </>
                )}
                {!hasVisibleTracks() && !hasTracks() && (
                    <Empty
                        title={'You don’t have track files'}
                        text={'You can import, create track files using OsmAnd.'}
                        folder={DEFAULT_GROUP_NAME}
                    />
                )}
            </Box>
        </>
    );
}

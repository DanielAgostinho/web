import React, { useContext, useState } from 'react';
import { Box, Button, Divider, Grid, ListItemText, MenuItem, Typography } from '@mui/material';
import { getPhotoTitle, WIKI_IMAGE_BASE_URL } from '../../../manager/SearchManager';
import styles from '../search.module.css';
import { useTranslation } from 'react-i18next';
import AppContext from '../../../context/AppContext';

export function getPhotoUrl(photo, size = 300) {
    const title = getPhotoTitle(photo);
    return `${WIKI_IMAGE_BASE_URL}${title}?width=${size}`;
}

export default function PhotoGallery({ photos }) {
    const ctx = useContext(AppContext);

    const MAX_PHOTOS = 100;

    const { t } = useTranslation();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState({});

    const filteredPhotos = filterPhotos(photos).slice(0, MAX_PHOTOS);

    const handleImageLoad = () => {
        setLoading(false);
    };

    const handleImageError = (index) => {
        setError((prevError) => ({ ...prevError, [index]: true }));
    };

    const handleOpen = () => ctx.setPhotoGallery(filteredPhotos);

    const handleImageClick = (index) => {
        ctx.setSelectedPhotoInd(index);
        ctx.setPhotoGallery(filteredPhotos);
    };

    function filterPhotos(photos) {
        const imageExtensions = ['.jpeg', '.jpg', '.png', '.gif'];
        return photos.features
            .filter((photo) => {
                const title = getPhotoTitle(photo);
                const extension = title.slice(title.lastIndexOf('.')).toLowerCase();
                return imageExtensions.includes(extension);
            })
            .sort((a, b) => a.properties.rowNum - b.properties.rowNum)
            .reduce((acc, photo) => {
                const uniqueKey = photo.properties.mediaId || photo.properties.imageTitle;
                if (!acc.find((item) => (item.properties.mediaId || item.properties.imageTitle) === uniqueKey)) {
                    photo.properties.imageTitle = photo.properties.imageTitle.replaceAll(' ', '_');
                    acc.push(photo);
                }
                return acc;
            }, []);
    }

    return (
        <>
            {filteredPhotos.length > 0 && (
                <Box sx={{ width: '100%' }}>
                    <MenuItem className={styles.photoTitle}>
                        <ListItemText>
                            <Typography className={styles.photoTitleText}>{t('online_photos')}</Typography>
                        </ListItemText>
                    </MenuItem>
                    <Grid container spacing={-0.5} sx={{ p: 2, width: '341px' }}>
                        {filteredPhotos.slice(0, 1).map((photo, index) => (
                            <Grid item xs={12} sm={6} key={index}>
                                {!error[index] && (
                                    <img
                                        onLoad={handleImageLoad}
                                        onError={() => handleImageError(index)}
                                        onClick={() => handleImageClick(index)}
                                        src={getPhotoUrl(photo)}
                                        alt={`Photo ${index + 1}`}
                                        className={styles.mainPhotoGallery}
                                        style={{
                                            display: loading ? 'none' : 'block',
                                        }}
                                    />
                                )}
                            </Grid>
                        ))}
                        <Grid item xs={12} sm={6} container>
                            {filteredPhotos.slice(1, 5).map((photo, index) => (
                                <Grid item xs={6} key={index + 1}>
                                    {!error[index + 1] && (
                                        <img
                                            onLoad={handleImageLoad}
                                            onError={() => handleImageError(index + 1)}
                                            onClick={() => handleImageClick(index + 1)}
                                            src={getPhotoUrl(photo)}
                                            alt={`Photo ${index + 2}`}
                                            className={styles.littlePhotoGallery}
                                            style={{
                                                display: loading ? 'none' : 'block',
                                            }}
                                        />
                                    )}
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                    {filteredPhotos.length > 0 && (
                        <Button onClick={handleOpen} sx={{ ml: 1 }}>
                            {`${t('shared_string_show_all')} (${filteredPhotos.length})`}
                        </Button>
                    )}
                    <Divider sx={{ marginTop: 2 }} />
                </Box>
            )}
        </>
    );
}

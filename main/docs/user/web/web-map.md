---
sidebar_position: 2
title: Web Map
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import AndroidStore from '@site/src/components/buttons/AndroidStore.mdx';
import AppleStore from '@site/src/components/buttons/AppleStore.mdx';
import LinksTelegram from '@site/src/components/_linksTelegram.mdx';
import LinksSocial from '@site/src/components/_linksSocialNetworks.mdx';
import Translate from '@site/src/components/Translate.js';
import InfoIncompleteArticle from '@site/src/components/_infoIncompleteArticle.mdx';

<InfoIncompleteArticle/>

## Map Context menu

For opening it right click anywhere on the map. This menu includes the following actions:

- **Where am I**
- **Show weather**
- **Create new route**
- **Add Favorite**
- **Directions from**
- **Directions to**
- **Cope coordinates**
- **Add pin**
- **Show regions**

![Map Context menu](@site/blog/2024-07-01-web-1-01/img/map_context_menu.png)

## Weather

The [Weather plugin](../plugins/weather.md) is a paid feature of the OsmAnd app. For the web version, Weather is a free feature with such capabilities as:
- Enable weather layers on the map: *Temperature, Pressure, Wind, Cloud cover and Precipitation* using the menu on the left or right.
- Enable the display of the weather forecast for the day or week (the forecast step is 3 hours).  

![OsmAnd Web Weather](@site/static/img/web/web_weather.png)


## POIs on the map

To show POIs on the map:

_Configure map menu or icon → POI overla... → choose categories_

![POIs menu](@site/static/img/web/poi_menu.png)


## URL scheme

For easy use of the OsmAnd application you can take advantage of direct links. These are special URLs that allow you to transfer location and contain detailed data about pins and tracks.  

These address strings can be copied and transferred using any data transfer medium supported by your device and used in the Android or iOS versions of OsmAnd.  

1. **URL with a pin on the map:**

  https://osmand.net/map/?pin=52.491143,7.116394#9/52.3924/6.3116

  ![OsmAnd Web Create Track](@site/static/img/plan-route/web_url_pin.png)

2. **URL without a pin on the map:**

  https://osmand.net/map/#9/52.3924/6.3116

  ![OsmAnd Web Create Track](@site/static/img/plan-route/web_url_without.png)

3. **URL with navigation:**

  https://osmand.net/map/?start=52.236210,5.119629&finish=52.412472,4.855957&type=osmand&profile=car&pin=52.491143,7.116394#9/52.3873/5.2570

  ![OsmAnd Web Create Track](@site/static/img/plan-route/web_url_track.png)

Depending on the specified parameters, URL strings may contain:

- **latitude:** latitude value as a number.  
- **longitude:** longitude value as a number.  
- **start-finish:** for navigation.
- **profile:** for navigation.
- **zoom:** zoom level.


## Tracks

It's a paid feature <ProFeature/>. At first you need to loggin your OsmAnd Pro:

![Track loggin](@site/static/img/web/track_loggin.png)

For Track section:
- Show tracks from [OsmAnd Cloud](#users-tracks-pro).
- Adding tracks on the map (_"Visible on map"_ folder).
- Looking all tracks info and graph
- Modify tracks and add it to Cloud.
- Download and delete tracks.
- Create new folders or delete it.
- Download folders as OSF or OBF collection.


### Visible on the map

Here there is a list of visible tracks on the map.

Switch on / off tracks for showing or not its on the map.

![Visible on the map](@site/static/img/web/visible.png)


### Track folder menu

Click to the _Tree points_ ⋮ button for open _Track Folder_ menu. Here you can Download all tracks from chosen folder as:
- Download as OSF
- Download as OBF Collection:
  You can get OBF map from this data: [OBF file](https://osmand.net/docs/technical/osmand-file-formats/osmand-obf/) or [Travel OBF](https://osmand.net/blog/routes#generated-travel-routes).

  [OBF file](https://osmand.net/docs/technical/osmand-file-formats/osmand-obf/):

  You can download offline map OBF (OsmAnd Binary Format) and open it with OsmAnd on device, it's suitable to display large quantity of tracks will be visible on the map.

  [Travel OBF](https://osmand.net/blog/routes#generated-travel-routes):

  Also You can import map of tracks as Travel book which will allow you also to select a specific track on the map and use it as normal GPX. Travel book also supports features such as displaying tracks as points, filtering tracks by activity type and filtering waypoints.

- Rename chosen folder.
- Delete chosen folder.

![Track folder menu](@site/static/img/web/collection.png)

### Cloud tracks

GPX tracks that you have in OsmAnd Cloud will be available for display and editing after login. Only for **Pro users** <ProFeature/>.

The following features are available after choosin cloud track:

- Information screens:
  - *Information* - displaying track data.
  - *Elevation* - graph of elevation.
  - *Speed* - speed graph.
  - *Slope* - slope graph.
  - *Settings* - list of navigation profiles for the *Create route* tool.  

- Action buttons:
  - *Edit track* - adding cloud track to local for editing (_Edit locality_ button on the panel).
  - *Download GPX* - downloads the track to the PC.
  - *Recalculate* Elevation (Satellite) - displays the elevation graph of the selected track.
  - *Delete Track* - deletes the track.
  - *Close track* - close the track.

![OsmAnd Web cloud GPX edit](@site/static/img/web/cloud_track.png)


## Favorites

After registering an OsmAnd Pro or OsmAnd Start, the user's Favorites are displayed in the Favorites menu.  
The following actions are available:

- _Show on map_ - show favorites points from the chosen folder on the map.
- _Rename_ - name and description of favorite folder.
- _Download_ - download the chosen favorite folder.
- _Delete_ - delete the chosen favorite folder.

![OsmAnd Web cloud Favorites edit](@site/static/img/web/favorites.png)

### Add / Edit Favorite

[To add](../personal/favorites.md#edit) a new favorite point, right-click on the screen. To start editing, click on the favorite point, the edit menu screen looks the same as [the menu in OsmAnd app](../personal/favorites.md#create).  

![OsmAnd Web Favorites add](@site/static/img/web/web_favorites_add.png)


<!--
## Map style

In this section of the menu, you can change the map style. You can read more about how to do this in the article [Vector Maps (Map Styles)](../map/vector-maps.md) for the OsmAnd app. The settings in the web version are no different.  
**Some examples:**

- Nautical map style

![OsmAnd Web Map Style](@site/static/img/web/web_map_style_nautical.png)

- Topo map style

![OsmAnd Web Favorites add](@site/static/img/web/web_map_style_topo.png)
-->

> *This article was last updated in September 2024*
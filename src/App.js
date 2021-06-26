import React, { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import {
    ListGroup,
    ListGroupItem
} from 'react-bootstrap';

import {
    GoogleMap,
    useLoadMap,
    Marker,
    Polyline,
    InfoWindow,
    useLoadScript,
    Data
} from "@react-google-maps/api";
import { formatRelative } from "date-fns";

import usePlacesAutoComplete, {
    getGeocode,
    getLatLng,
} from "use-places-autocomplete";

import {
    DragDropContext,
    Droppable,
    Draggable,
} from 'react-beautiful-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import {
    Combobox,
    ComboboxInput,
    ComboboxPopover,
    ComboboxList,
    ComboboxOption,
} from "@reach/combobox";


import "@reach/combobox/styles.css";
import mapStyles from "./mapStyles";

const libraries = ["places"];
const mapContainerStyle = {
    width: "100vw",
    maxWidth: "100 %",
    height: "100vh",
};
const center = {
    lat: 43.65,
    lng: -79.38
};
const options = {
    styles: mapStyles,
    disableDefaultUI: true,
    zoomControl: true,

};

const optionsLine = {
    strokeColor: '#FF0000',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: '#FF0000',
    fillOpacity: 0.35,
    clickable: false,
    draggable: false,
    editable: false,
    visible: true,
    radius: 30000,
    zIndex: 1
};

export default function App() {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: "AIzaSyCB3oTCWDPZyhRnOeOkG_TfsC2dIVd7HD0",
        libraries,
    });

    var deleted = false;
    const [markers, setMarkers] = React.useState([]);
    const [selected, setSelected] = React.useState(null);
    const [pathCoordinates, setPathsCoordinates] = React.useState([]);
    const [cardList, setCardList] = React.useState([]);

    const onMapClock = React.useCallback((evt) => {
        const newLat = evt.latLng.lat();
        const newLng = evt.latLng.lng();

        setToList(newLat, newLng, setMarkers);
        setToList(newLat, newLng, setCardList);
        setToList(newLat, newLng, setPathsCoordinates);
    }, []);
                        
    const putMarker = React.useCallback(({ lat, lng }) => {
        setToList(lat, lng, setMarkers);
        setToList(lat, lng, setCardList);
        setToList(lat, lng, setPathsCoordinates);
    }, []);

    const setToList = React.useCallback((newLat, newLng, listSetter) => {
        listSetter(current => [...current, {
            id:current.length > 0 ? current[current.length - 1].id + 1 : 1,
            lat: newLat,
            lng: newLng,
            time: new Date(),
        }]);
    });

    const changePosition = React.useCallback((id, evt, markers, cardList, paths) => {
        const newLat = evt.latLng.lat();
        const newLng = evt.latLng.lng();

        changeListPosition(id, newLat, newLng, markers, setMarkers);
        changeListPosition(id, newLat, newLng, cardList, setCardList);
        changeListPosition(id, newLat, newLng, paths, setPathsCoordinates);
    }, []);

    const changeListPosition = React.useCallback((id, newLat, newLng, list, listSetter) => {
        console.log(list.lenght);
        const itemIndex = list.findIndex(
            item => item.id === Number(id)
        );

        if (itemIndex !== -1) {
            const children = [...list];
            const child = children[itemIndex];
            children.splice(itemIndex, 1, {
                ...child,
                lat: newLat,
                lng: newLng,
            });

            listSetter(children);
        }
    });

    const removeMarker = React.useCallback((id) => {
        removeItemFromList(id, markers, setMarkers);
        removeItemFromList(id, cardList, setCardList);
        removeItemFromList(id, pathCoordinates, setPathsCoordinates);
        //gotoNextMarker(id, markers);
    });

    const removeItemFromList = React.useCallback((id, list, setList) => {
        const itemIndex = list.findIndex(
            item => item.id === Number(id)
        );

        if (itemIndex !== -1) {
            const children = [...list];

            children.splice(itemIndex, 1);
            changeIndexes(itemIndex, children);

            setList(children);
        }
    });

    const gotoNextMarker = React.useCallback((id, list) => {
        const itemIndex = list.findIndex(
            item => item.id === Number(id)
        );

        var item = itemIndex !== -1 ? list[itemIndex] : list[list.lenght - 1];
        const lat = item.lat;
        const lng = item.lng;

        panTo({ lat, lng });
    });

    const changeIndexes = React.useCallback((startIndex, list) => {
        var id = startIndex > 0 ? list[startIndex-1].id : 0; 

        for (var i = startIndex; i < list.length; i++) {
            list[i].id = ++id;
        }
    });

    const mapRef = React.useRef();
    const onMapLoad = React.useCallback((map) => {
        mapRef.current = map;
    }, []);

    const panTo = React.useCallback(({ lat, lng }) => {
        mapRef.current.panTo({ lat, lng });
        mapRef.current.setZoom(8);
    }, []);


    if (loadError) return "Error loading maps";
    if (!isLoaded) return "Loading maps";

    return (
        <div className="app">
            <div className="panel">
                <div className="headerText">
                    <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhtbG5zOnN2Z2pzPSJodHRwOi8vc3ZnanMuY29tL3N2Z2pzIiB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgeD0iMCIgeT0iMCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTIiIHhtbDpzcGFjZT0icHJlc2VydmUiIGNsYXNzPSIiPjxnPjxnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0ibTM0Ny4yODYgMjAzLjg3NmMtMjIxLjE5LTc1LjU4OS03Mi4wNDYtMTY2LjE0MiAzLjAyLTIwMS44NTMgMS4wMjYtLjQ4Ny42NzctMi4wMjMtLjQ1OS0yLjAyM2gtNTMuNTVjLTguNDY5IDAtMTYuODM4IDEuOTYtMjQuNTgyIDUuNzQ1LTg1LjAzOSA0MS41NjYtMjU2LjUwMiAxNDIuNjk1LTExNy45OCAyMjcuNTEgMTU4Ljg1MSA5Ny4yNjEtMTEuNDUgMjI0LjI2Ny0xMDAuNTc1IDI3OC43NDVoMzQ5LjQ3OGM0Ni43MzYtNjYuNzA4IDE0My41NzMtMjQwLjE0NC01NS4zNTItMzA4LjEyNHoiIGZpbGw9IiM2NjVlNjgiIGRhdGEtb3JpZ2luYWw9IiM2NjVlNjgiIHN0eWxlPSIiIGNsYXNzPSIiPjwvcGF0aD48cGF0aCBkPSJtNTMuMTYgNTEyaDc2Ljc3NmM5MS41NjgtNjMuMTE4IDIzMS43MTQtMTg4LjA2OCA4Mi44NjktMjg1LjE4OS0xMjQuMjM4LTgxLjA2NC44NzQtMTc2LjExMyA4OS4zNDktMjI2LjgxMWgtNS44NTdjLTguNDY5IDAtMTYuODM4IDEuOTYtMjQuNTgyIDUuNzQ1LTg1LjAzOSA0MS41NjYtMjU2LjUwMiAxNDIuNjk1LTExNy45OCAyMjcuNTEgMTU4Ljg1MSA5Ny4yNjEtMTEuNDUgMjI0LjI2Ny0xMDAuNTc1IDI3OC43NDV6IiBmaWxsPSIjNTU0ZTU2IiBkYXRhLW9yaWdpbmFsPSIjNTU0ZTU2IiBzdHlsZT0iIiBjbGFzcz0iIj48L3BhdGg+PGc+PHBhdGggZD0ibTIxNy44MDQgNzEuMzM5Yy0yLjUxOSAwLTQuOTg4LTEuMjI5LTYuNDczLTMuNDkzLTIuMzQyLTMuNTcxLTEuMzQ2LTguMzY0IDIuMjI2LTEwLjcwNiAzLjQxOS0yLjI0MiA1LjU3LTMuNDcxIDUuNjU5LTMuNTIyIDMuNzEtMi4xMTUgOC40MzMtLjgyIDEwLjU0NiAyLjg5MSAyLjExMyAzLjcwOS44MiA4LjQyOC0yLjg4NyAxMC41NDMtLjA1MS4wMjktMS44OTIgMS4wODctNC44MzggMy4wMTktMS4zMDcuODU4LTIuNzc4IDEuMjY3LTQuMjMzIDEuMjY4eiIgZmlsbD0iI2RmZWJmYSIgZGF0YS1vcmlnaW5hbD0iI2RmZWJmYSIgc3R5bGU9IiIgY2xhc3M9IiI+PC9wYXRoPjwvZz48ZyBmaWxsPSIjZGZlYmZhIj48cGF0aCBkPSJtMjkxLjQyIDQ0MS45MzVjLTEuODgyIDAtMy43NjgtLjY4My01LjI1Ny0yLjA2NC0zLjEzMS0yLjkwNC0zLjMxNC03Ljc5Ny0uNDA5LTEwLjkyNyAyLjgxNC0zLjAzMyA1LjU1OS02LjExOSA4LjE2LTkuMTczIDIuNzctMy4yNTEgNy42NS0zLjY0MiAxMC45LS44NzIgMy4yNTEgMi43NjkgMy42NDIgNy42NDkuODcyIDEwLjktMi43NDIgMy4yMTktNS42MzQgNi40Ny04LjU5NiA5LjY2My0xLjUyMyAxLjY0Mi0zLjU5NCAyLjQ3My01LjY3IDIuNDczeiIgZmlsbD0iI2RmZWJmYSIgZGF0YS1vcmlnaW5hbD0iI2RmZWJmYSIgc3R5bGU9IiIgY2xhc3M9IiI+PC9wYXRoPjxwYXRoIGQ9Im0zMjQuMTkxIDM5OC4zOWMtMS4zMDcgMC0yLjYzMi0uMzMyLTMuODQ2LTEuMDMtMy43MDMtMi4xMjgtNC45NzgtNi44NTUtMi44NS0xMC41NTcgMi4wNDUtMy41NTkgMy45MzEtNy4xMzUgNS42MDMtMTAuNjMgMS44NDMtMy44NTIgNi40Ni01LjQ4MSAxMC4zMTItMy42MzggMy44NTMgMS44NDMgNS40ODEgNi40NiAzLjYzOCAxMC4zMTItMS44NCAzLjg0NS0zLjkwNyA3Ljc3LTYuMTQ3IDExLjY2My0xLjQzIDIuNDg3LTQuMDMzIDMuODgtNi43MSAzLjg4eiIgZmlsbD0iI2RmZWJmYSIgZGF0YS1vcmlnaW5hbD0iI2RmZWJmYSIgc3R5bGU9IiIgY2xhc3M9IiI+PC9wYXRoPjxwYXRoIGQ9Im0zNDEuNTk0IDM0Ny4xMTNjLS4yMDUgMC0uNDEyLS4wMDgtLjYyLS4wMjUtNC4yNTctLjMzOC03LjQzNS00LjA2Mi03LjA5Ny04LjMxOS4xNjYtMi4wODUuMjQ5LTQuMTc5LjI0OS02LjIyNS4wMDEtMS43MzktLjA2LTMuNDktLjE4LTUuMjA0LS4yOTktNC4yNiAyLjkxMy03Ljk1NSA3LjE3Mi04LjI1NCA0LjI1LS4zMDIgNy45NTUgMi45MTIgOC4yNTQgNy4xNzIuMTQ1IDIuMDc0LjIxOSA0LjE4OS4yMTggNi4yODggMCAyLjQ1LS4xIDQuOTU2LS4yOTggNy40NDUtLjMyIDQuMDQ5LTMuNzA1IDcuMTIyLTcuNjk4IDcuMTIyeiIgZmlsbD0iI2RmZWJmYSIgZGF0YS1vcmlnaW5hbD0iI2RmZWJmYSIgc3R5bGU9IiIgY2xhc3M9IiI+PC9wYXRoPjxwYXRoIGQ9Im0zMjguMDg2IDI5NS4zMjZjLTIuNTA4IDAtNC45NjktMS4yMTktNi40NTctMy40NjgtMi4wNjktMy4xMjktNC40MjktNi4yNDQtNy4wMTYtOS4yNTktMi43OC0zLjI0MS0yLjQwNy04LjEyMi44MzQtMTAuOTAzczguMTIyLTIuNDA4IDEwLjkwMy44MzRjMy4wMDQgMy41MDEgNS43NTUgNy4xMzQgOC4xNzggMTAuNzk3IDIuMzU1IDMuNTYyIDEuMzc4IDguMzU5LTIuMTg0IDEwLjcxNS0xLjMxMy44NjktMi43OTQgMS4yODQtNC4yNTggMS4yODR6IiBmaWxsPSIjZGZlYmZhIiBkYXRhLW9yaWdpbmFsPSIjZGZlYmZhIiBzdHlsZT0iIiBjbGFzcz0iIj48L3BhdGg+PHBhdGggZD0ibTI4OC41NjUgMjU4LjI2MmMtMS40MzYgMC0yLjg4OC0uMzk5LTQuMTgzLTEuMjM1LTMuMjkzLTIuMTI0LTYuNzkxLTQuMjM0LTEwLjM5Ni02LjI3Mi0zLjcxOC0yLjEwMS01LjAyNy02LjgxOS0yLjkyNi0xMC41MzYgMi4xMDEtMy43MTggNi44MTktNS4wMjcgMTAuNTM2LTIuOTI2IDMuODY1IDIuMTg1IDcuNjIyIDQuNDUyIDExLjE2NiA2LjczNyAzLjU4OSAyLjMxNSA0LjYyMiA3LjEgMi4zMDggMTAuNjg5LTEuNDc4IDIuMjkzLTMuOTY2IDMuNTQzLTYuNTA1IDMuNTQzeiIgZmlsbD0iI2RmZWJmYSIgZGF0YS1vcmlnaW5hbD0iI2RmZWJmYSIgc3R5bGU9IiIgY2xhc3M9IiI+PC9wYXRoPjxwYXRoIGQ9Im0yNDAuMTU1IDIzMy4xOGMtMS4xNzYgMC0yLjM2OS0uMjY5LTMuNDktLjgzNy0zLjkxOC0xLjk4Ni03Ljc0OS00LjAxOS0xMS4zODUtNi4wNDEtMy43MzItMi4wNzYtNS4wNzUtNi43ODQtMi45OTktMTAuNTE2IDIuMDc2LTMuNzMzIDYuNzgzLTUuMDc3IDEwLjUxNi0yLjk5OSAzLjQ2NCAxLjkyNyA3LjExOCAzLjg2NSAxMC44NiA1Ljc2MiAzLjgwOSAxLjkzMSA1LjMzMiA2LjU4NCAzLjQwMSAxMC4zOTMtMS4zNjIgMi42ODgtNC4wODIgNC4yMzgtNi45MDMgNC4yMzh6IiBmaWxsPSIjZGZlYmZhIiBkYXRhLW9yaWdpbmFsPSIjZGZlYmZhIiBzdHlsZT0iIiBjbGFzcz0iIj48L3BhdGg+PHBhdGggZD0ibTE5NC4zMzcgMjAzLjc4NGMtMS43NzQgMC0zLjU1Ni0uNjA3LTUuMDEyLTEuODQ3LTMuNTAxLTIuOTg0LTYuNzc2LTYuMDQ1LTkuNzMzLTkuMDk3LTIuOTcyLTMuMDY3LTIuODk0LTcuOTYyLjE3NC0xMC45MzMgMy4wNjgtMi45NzIgNy45NjItMi44OTMgMTAuOTMzLjE3NCAyLjYxNiAyLjcgNS41MjkgNS40MjIgOC42NTcgOC4wODggMy4yNSAyLjc3IDMuNjQgNy42NS44NjkgMTAuOS0xLjUyOSAxLjc5Mi0zLjcwMiAyLjcxNS01Ljg4OCAyLjcxNXoiIGZpbGw9IiNkZmViZmEiIGRhdGEtb3JpZ2luYWw9IiNkZmViZmEiIHN0eWxlPSIiIGNsYXNzPSIiPjwvcGF0aD48cGF0aCBkPSJtMTY0LjQwMiAxNTkuMzU2Yy0zLjU3OCAwLTYuNzktMi40OTctNy41NTgtNi4xMzgtLjg4LTQuMTcyLTEuMzI2LTguNDMzLTEuMzI2LTEyLjY2NC0uMDAxLS41NDcuMDA3LTEuMDk5LjAyMi0xLjY1MS4xMTctNC4yNjkgMy42ODQtNy42MTcgNy45NDEtNy41MTggNC4yNjkuMTE3IDcuNjM1IDMuNjcyIDcuNTE4IDcuOTQxLS4wMTEuNDA2LS4wMTcuODEyLS4wMTYgMS4yMiAwIDMuMTY4LjMzNCA2LjM1NS45OTMgOS40OC44ODEgNC4xNzgtMS43OTEgOC4yOC01Ljk3IDkuMTYxLS41MzkuMTE1LTEuMDc2LjE2OS0xLjYwNC4xNjl6IiBmaWxsPSIjZGZlYmZhIiBkYXRhLW9yaWdpbmFsPSIjZGZlYmZhIiBzdHlsZT0iIiBjbGFzcz0iIj48L3BhdGg+PHBhdGggZD0ibTE3Ny44NzMgMTA4LjE2MmMtMS41NzIgMC0zLjE1OC0uNDc4LTQuNTI4LTEuNDctMy40NTktMi41MDQtNC4yMzMtNy4zMzktMS43MjgtMTAuNzk3IDIuNTI0LTMuNDg2IDUuMzcyLTYuOTkxIDguNDY1LTEwLjQxNyAyLjg2LTMuMTY5IDcuNzQ5LTMuNDIyIDEwLjkyMS0uNTU5IDMuMTcgMi44NjEgMy40MiA3Ljc1LjU1OSAxMC45MjEtMi43MjIgMy4wMTYtNS4yMTggNi4wODYtNy40MTkgOS4xMjUtMS41MTIgMi4wODgtMy44NzQgMy4xOTctNi4yNyAzLjE5N3oiIGZpbGw9IiNkZmViZmEiIGRhdGEtb3JpZ2luYWw9IiNkZmViZmEiIHN0eWxlPSIiIGNsYXNzPSIiPjwvcGF0aD48L2c+PGc+PHBhdGggZD0ibTI1Ni4wMDYgNDc0Ljc4N2MtMi4zMzYgMC00LjY0NC0xLjA1NC02LjE2NS0zLjA1OS0yLjU4MS0zLjQwMi0xLjkxNi04LjI1MiAxLjQ4Ni0xMC44MzQuMDE0LS4wMTEgMS43MTQtMS4zMDUgNC41NjktMy42NjYgMy4yOTEtMi43MjIgOC4xNjYtMi4yNiAxMC44ODYgMS4wMyAyLjcyMiAzLjI5MSAyLjI2IDguMTY1LTEuMDMgMTAuODg2LTMuMTMzIDIuNTkyLTQuOTk5IDQuMDEtNS4wNzcgNC4wNjktMS4zOTggMS4wNjEtMy4wNCAxLjU3NC00LjY2OSAxLjU3NHoiIGZpbGw9IiNkZmViZmEiIGRhdGEtb3JpZ2luYWw9IiNkZmViZmEiIHN0eWxlPSIiIGNsYXNzPSIiPjwvcGF0aD48L2c+PHBhdGggZD0ibTM2NC45ODIgMTg1LjMzN2MtMjEwLjc4OS02NS4xNDYtODkuMTY5LTEzOS4zMy0xMS4xMjUtMTc3LjU0MiAzLjY0Ny0xLjc4NSAyLjQ4Ni03Ljc5NS0xLjUwMy03Ljc5NWgtMi45Yy03My40MTUgMzQuMjAyLTIzMi44MTUgMTI2LjgxNS03LjMxOCAyMDMuODc2IDE5OC45MjMgNjcuOTggMTAyLjA4NyAyNDEuNDE2IDU1LjM1MSAzMDguMTI0aDM5LjYwOWM5LjkxNiAwIDE5LjAyNi02LjAxMyAyMy43MS0xNS42NTkgNDQuOTA0LTkyLjQ1NyA4Ni44MTEtMjU0LjU1OS05NS44MjQtMzExLjAwNHoiIGZpbGw9IiM0NjQ0NDEiIGRhdGEtb3JpZ2luYWw9IiNmZmQzMDEiIHN0eWxlPSIiIGNsYXNzPSIiPjwvcGF0aD48Zz48Zz48cGF0aCBkPSJtMTU1Ljc5NSAyMzMuMjU1Yy0xMDIuNDEzLTYyLjcwNi0zNy40NDMtMTM0LjMzIDM4LjgyOC0xODQuMjA4LTg1LjMyNiA0Ny44NDktMTgzLjE4MyAxMjYuNDkyLTY4LjQ3NiAxOTYuNzI0IDEzNC4zNTEgODIuMjYxLTYuNTgxIDE4NS43OTctMTA5LjI1NyAyNDguNzM2LTcuNjI4IDQuNjc3LTQuNjA4IDE3LjQ5MyA0LjExOSAxNy40OTNoMzQuMjExYzg5LjEyNi01NC40NzggMjU5LjQyNy0xODEuNDg0IDEwMC41NzUtMjc4Ljc0NXoiIGZpbGw9IiM0NjQ0NDEiIGRhdGEtb3JpZ2luYWw9IiNmZmMyMGMiIHN0eWxlPSIiIGNsYXNzPSIiPjwvcGF0aD48L2c+PC9nPjwvZz48L2c+PC9zdmc+" />
                    <h1>{" "}my path</h1>
                </div>

                <Search panTo={panTo} putMarker={putMarker}/>

                {cardList.length > 0 ? (
                    <CardList
                        removeMarker={removeMarker}
                        setSelected={setSelected}
                        cardList={cardList}
                        markers={markers}
                        pathCoordinates={pathCoordinates}
                        setCardList={setCardList}
                        setMarkers={setMarkers}
                        setPathsCoordinates={setPathsCoordinates}
                    />
                ) : null}
            </div>

            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                zoom={8}
                center={center}
                options={options}
                onClick={onMapClock}
                onLoad={onMapLoad}
            >

                {markers.map((marker) => (
                    <Marker
                        key={marker.time.toISOString()}
                        draggable={true}
                        onDragEnd={(evt) => {
                            changePosition(
                                marker.id,
                                evt,
                                markers,
                                cardList,
                                pathCoordinates,
                            );
                        }}
                        onDrag={(evt) => {
                            changePosition(
                                marker.id,
                                evt,
                                markers,
                                cardList,
                                pathCoordinates,
                            );
                        }}
                        position={{
                            lat: marker.lat,
                            lng: marker.lng
                        }}
                        icon={{
                            url: "/positional-map.svg",
                            scaledSize: new window.google.maps.Size(40, 40),
                            //origin:    new window.google.maps.Point(0, 0),
                            //anchor: new window.google.maps.Point(15, 15),

                        }}
                        onClick={() => {
                            setSelected(marker);
                        }} 
                    />
                ))}

                <Polyline
                    path={pathCoordinates}
                    geodesic={true}
                    options={{ optionsLine}}
                />

                {selected? (
                    <InfoWindow
                        position={{
                            lat: selected.lat,
                            lng: selected.lng
                        }}
                        onCloseClick={() => {
                            setSelected(null)
                        }}
                    >
                        <div>
                            {/*<p>{"".concat("Lat:", selected.lat, " ", "Lng:", selected.lng ) }</p>*/}
                            <p>{"".concat("Точка ", selected.id)}</p>
                        </div>
                    </InfoWindow>
                ) : null}


            </GoogleMap>

            <Locate panTo={panTo} />
        </div>
    );
}

function Locate({ panTo }) {
    return (
        <button
            className="locate"
            onClick={() => {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        panTo({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        })
                    },
                    () => null,
                    options
                );
            }}
        >
            <img src="compass.svg" alt="compass" />
        </button>
    );
}

function Search({ panTo, putMarker }) {
    const {
        ready,
        value,
        suggestions: { status, data },
        setValue,
        clearSuggestions,
    } = usePlacesAutoComplete({
        requestOptions: {
            location: {
                lat: () => 43.65,
                lng: () => -79.38,
            },
            radius: 200 * 1000,
        },
    });

    return (
        <div className="search">
            <Combobox
                onSelect={async (address) => {
                    setValue(address, false);
                    clearSuggestions();

                    try {
                        console.log(address);
                        const results = await getGeocode({ address });
                        const { lat, lng } = await getLatLng(results[0]);
                        panTo({ lat, lng });
                        putMarker({ lat, lng });
                    } catch (error) {
                        console.log(error)
                    }
                }}
            >
                <ComboboxInput
                    value={value}
                    onChange={(e) => {
                        setValue(e.target.value)
                    }}
                    disabled={!ready}
                    placeholder="Enter an address"
                />

                <ComboboxPopover>
                    <ComboboxList>
                        {status === "OK" && data.map(({ id, description }) => (
                            <ComboboxOption
                                key={id}
                                value={description}
                            />
                        ))}
                    </ComboboxList>
                </ComboboxPopover>
            </Combobox>
        </div>
    )
}

function CardList({
    removeMarker,
    setSelected,
    cardList,
    markers,
    pathCoordinates,
    setCardList, setMarkers,
    setPathsCoordinates }) {

    function handleOnDragEnd(result) {
        if (!result.destination) return;

        console.log(result);

        sortList(result, cardList, setCardList);
        sortList(result, markers, setMarkers);
        sortList(result, pathCoordinates, setPathsCoordinates);
    }

    const sortList = React.useCallback((result, list, setter)=> {
        const items = Array.from(list);
        const [reorderedItems] = items.splice(result.source.index - 1, 1);
        items.splice(result.destination.index - 1, 0, reorderedItems);

        for (var i = 0; i < items.length; i++) {
            items[i].id = i + 1;
        };

        setter(items);
    });

    return (
        <DragDropContext onDragEnd={handleOnDragEnd} >
            <Droppable droppableId="cList" >
                {(provided) => (
                    <ListGroup as="ul"
                        className="cardList"
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                    >
                        {cardList.map((card) => {
                            return (
                                <Draggable key={(card.id).toString()} draggableId={(card.id).toString()} index={card.id}>
                                    {(provided) => (
                                        <ListGroup.Item as="li"
                                            //variant="secondary"
                                            style="padding-right:1rem;"
                                            action variant="light"
                                            
                                            onClick={() => {
                                                setSelected(markers[card.id - 1]);
                                            }} 
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            ref={provided.innerRef}
                                        >
                                            <div 
                                                className="dragIcon"
                                            >
                                                <img src="draghandler.svg" alt="drag" />
                                            </div>
                                            <div
                                                className="markerName"
                                            >
                                                <p>
                                                    {"".concat(
                                                        "point ",
                                                        card.id,
                                                        " - ",
                                                        "Lat:",
                                                        card.lat.toString().substr(0, 6),
                                                        " ",
                                                        "Lng:",
                                                        card.lng.toString().substr(0, 6)
                                                    )}
                                                </p>

                                            </div>

                                            <button
                                                className="removeMaker"
                                                onClick={(e) => {
                                                    removeMarker(card.id)
                                                    e.stopPropagation();
                                                }}
                                            >
                                                <img src="minus.svg" alt="compass" />
                                            </button>
                                        </ListGroup.Item>                                        
                                    )}                                    
                                </Draggable>
                            );
                        })}
                        {provided.placeholder}
                    </ListGroup>
                )}
            </Droppable>
        </DragDropContext>
    );
}

import React, { useState } from "react";
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

import { DndProvider } from 'react-dnd'
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

    const [markers, setMarkers] = React.useState([]);
    const [selected, setSelected] = React.useState(null);
    const [pathCoordinates, setPathsCoordinates] = React.useState([]);
    const [listPos, setListPos] = React.useState([]);
    const [cardList, setCardList] = React.useState([]);

    const onMapClock = React.useCallback((event) => {
        setMarkers(current => [...current, {
            id: current.length + 1,
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
            time: new Date(),
        }])

        setPathsCoordinates(current => [...current, {
            id: current.length + 1,
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
        }])

        setCardList(current => [...current, {
            id: current.length + 1,
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
        }])

    }, []);


    const changePosition = React.useCallback((markers, paths, cardList, marker, event) => {
        const id = marker.id;
        const newLat = event.latLng.lat();
        const newLng = event.latLng.lng();

        const itemIndexM = markers.findIndex(
            item => item.id === Number(id)
        );

        if (itemIndexM !== -1) {
            // Make a copy of the state
            const childrenM = [...markers];
            // The child item
            const childM = childrenM[itemIndexM];
            // Update the child's age
            childrenM.splice(itemIndexM, 1, {
                ...childM,
                lat:newLat,
                lng: newLng,
                time: new Date(),
            });
            // Update the state
            setMarkers(childrenM);
        }


        const itemIndexP = paths.findIndex(
            item => item.id === Number(id)
        );

        if (itemIndexP !== -1) {
            // Make a copy of the state
            const childrenP = [...paths];
            // The child item
            const childP = childrenP[itemIndexP];
            // Update the child's age
            childrenP.splice(itemIndexP, 1, {
                ...childP,
                lat: newLat,
                lng: newLng,
            });
            // Update the state
            setPathsCoordinates(childrenP);
        }


        const itemIndexC = cardList.findIndex(
            item => item.id === Number(id)
        );

        if (itemIndexC !== -1) {
            // Make a copy of the state
            const childrenC = [...cardList];
            // The child item
            const childC = childrenC[itemIndexC];
            // Update the child's age
            childrenC.splice(itemIndexC, 1, {
                ...childC,
                lat: newLat,
                lng: newLng,
            });
            // Update the state
            setCardList(childrenC);
        }

    }, []);


    const putMarker = React.useCallback(({ lat, lng }) => {
        setMarkers(current => [...current, {
            id: current.length + 1,
            lat: lat,
            lng: lng,
            time: new Date(),
        }])
    }, []);

    const mapRef = React.useRef();
    const onMapLoad = React.useCallback((map) => {
        mapRef.current = map;
    }, []);

    const panTo = React.useCallback(({ lat, lng }) => {
        mapRef.current.panTo({ lat, lng });
        mapRef.current.setZoom(14);
    }, []);

    //const removeMarker = React.useCallback((markers, cardList, card) => {
    //    const id = card.id;

    //    const itemIndexM = markers.findIndex(
    //        item => item.id === Number(id)
    //    );

    //    if (itemIndexM !== -1) {
    //        // Make a copy of the state
    //        const childrenM = [...markers];
    //        // The child item
    //        const childM = childrenM[itemIndexM];
    //        // Update the child's age
            
    //        //childrenM.splice(itemIndexM, 1, {
    //        //    ...childM,
    //        //    lat: newLat,
    //        //    lng: newLng,
    //        //    time: new Date(),
    //        //});
    //        // Update the state
    //        setMarkers(childrenM);
    //    }
    //});

    if (loadError) return "Error loading maps";
    if (!isLoaded) return "Loading maps";

    return (
        <div className="app">
            <div className="panel">
                <h1>
                    it`s my path{" "}
                    <span role="img" aria-label="tent">
                        🚍
                    </span>
                </h1>

                <Search panTo={panTo} putMarker={putMarker} />

                {cardList.length > 0 ? (
                    <div>
                        {CardList(cardList)}
                    </div>
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
                            changePosition(markers, pathCoordinates, marker, evt);
                        }}
                        onDrag={(evt) => {
                            //changeLine(markers, marker, evt)
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

                {selected ? (
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
                            <p>{"".concat("Lat:", selected.lat, " ", "Lng:", selected.lng ) }</p>
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

function Search(props) {
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
        <div className="search" zIndex={100}>
            <Combobox
                onSelect={async (address) => {
                    setValue(address, false);
                    clearSuggestions();

                    try {
                        const results = await getGeocode({ address });
                        const { lat, lng } = await getLatLng(results[0]);

                        props.panTo({ lat, lng });
                        props.putMarker({ lat, lng });

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

function CardList(cardList, markers) {
    return (
        <div className="cardList">      
            {cardList.map(card =>
                <div className = "card">
                    <p>{"".concat("Lat:", card.lat, " ", "Lng:", card.lng)}</p>

                    <button
                        className="removeMaker"
                        onClick={() => {
                            //removeMarker(markers, cardList, card)
                        }}
                    >
                        <img src="minus.svg" alt="compass" />
                    </button>
                </div>  
            )}
        </div> 
    );
}

//function NumberList(props) {
//    const markers = props.markers;

//    const listItems = numbers.map((number) =>
//        <li>{number}</li>
//    );
//    return (
//        <ul>{listItems}</ul>
//    );
//}

import React, { useState } from "react";
import {
    GoogleMap,
    useLoadMap,
    Marker,
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

export default function App() {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: "AIzaSyCB3oTCWDPZyhRnOeOkG_TfsC2dIVd7HD0",
        libraries,
    });

    const [markers, setMarkers] = React.useState([]);
    const [selected, setSelected] = React.useState(null);

    const onMapClock = React.useCallback((event) => {
        setMarkers(current => [...current, {
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
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

    if (loadError) return "Error loading maps";
    if (!isLoaded) return "Loading maps";

    return (
        <div>
            <h1>
                it`s my path{" "}
                <span role="img" aria-label="tent">
                    🚍
                </span>
            </h1>

            <Search panTo={panTo} />
            <Locate panTo={panTo} />

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
                            <p>{formatRelative(selected.time, new Date())}</p>
                        </div>
                    </InfoWindow>
                ): null}
            </GoogleMap>
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

function Search({ panTo }) {
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
                        const results = await getGeocode({ address });
                        const { lat, lng } = await getLatLng(results[0]);
                        panTo({ lat, lng });

                    } catch (error) {
                        console.log(error)
                    }
                    //console.log(address);
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

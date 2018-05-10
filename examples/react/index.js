import React, { Component } from 'react';
import ReactDOMServer from 'react-dom/server';
import { Gmap, DirectionsService } from 'gmap-base';

class GmapComponent extends Component {
    constructor(props) {
        super(props);
        this.center = 'Dam square, Amsterdam';
        this.apiKey = 'here-be-your-api-key';
        this.form = null;
        this.rootElement = null;
        this.gmap = null;
        this.state = { info: '' };
    }

    componentDidMount() {
        const { center, apiKey, rootElement } = this;

        this.gmap = new Gmap({
            rootElement,
            center,
            apiKey,
            callbacks: {
                API_READY: this.onApiReady,
                MAP_READY: this.onMapReady,
            },
        });
    }

    onChangeDirections = (event) => {
        event.preventDefault();
        const { form } = this;
        const origin = form.children.namedItem('origin').value;
        const travelMode = form.children.namedItem('travelModeOptions').children.namedItem('travelMode').value;

        if (!origin) {
            return;
        }

        const directionsService = this.gmap.getService('Directions');

        directionsService
            .setInfoWindowContentFunc(this.infoWindowContent)
            .showRoutes({
                destination: this.center,
                origin,
                travelMode,
                provideRouteAlternatives: true,
            });
    }

    onApiReady = () => {
        const directionsService = new DirectionsService({
            callbacks: {
                NOT_FOUND: this.onOriginNotFound,
            },
        });
        this.gmap.addService(directionsService);
    }

    onMapReady = () => {
        this.gmap.addMarker(this.center);
    }

    onOriginNotFound = (response) => {
        this.setState({ info: `Origin '${response.request.origin.query}' could not be found` });
    }

    infoWindowContent = ({ travelMode, distance, duration }) => ReactDOMServer.renderToStaticMarkup((
        <div>
            <div>{travelMode}</div>
            <span>Time: {duration.text}</span>
            <div>Distance: {distance.text}</div>
        </div>
    ));

    render() {
        const { info } = this.state;

        return (
            <div>
                <p>Directions</p>
                <form onSubmit={this.onChangeDirections} ref={(ref) => { this.form = ref; }} >
                    <label htmlFor="origin">Origin</label><br />
                    <input id="origin" type="text" />

                    <fieldset id="travelModeOptions">
                        <input id="travelModeTransit" type="radio" name="travelMode" defaultValue="TRANSIT" /> <label htmlFor="travelModeTransit">Transit</label><br />
                        <input id="travelModeBicycling" type="radio" name="travelMode" defaultValue="BICYCLING" /> <label htmlFor="travelModeBicycling">Bicycling</label><br />
                        <input id="travelModeTransit" type="radio" name="travelMode" defaultValue="WALKING" /> <label htmlFor="travelModeTransit">Walking</label><br />
                        <input id="travelModeWalking" type="radio" name="travelMode" defaultValue="DRIVING" /> <label htmlFor="travelModeWalking">Driving</label>
                    </fieldset>

                    <button type="submit">Show</button>
                </form>

                {info && info}

                <div style={{ width: '600px', height: '400px' }} ref={(ref) => { this.rootElement = ref; }} />
            </div>
        );
    }
}

export default GmapComponent;

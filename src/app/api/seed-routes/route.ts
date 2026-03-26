import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const routes = [
        {
            route_title: "Rumuokoro to Choba (UNIPORT)",
            start_location: "Rumuokoro",
            vehicle_type_used: "Bus, Keke",
            fare_price_range_min: 300,
            fare_price_range_max: 350,
            estimated_travel_time_min: 25,
            estimated_travel_time_max: 40,
            difficulty_level: 'Easy',
            status: 'approved',
            stops_along_the_way: JSON.stringify([
                { type: "start", location: "Rumuokoro Roundabout", instruction: "Board a bus heading to Choba/UNIPORT from the main park.", vehicle: "Bus", fare: 300 },
                { type: "stop", location: "Alakahia Junction", instruction: "Bus generally stops here to drop off passengers.", vehicle: "Bus", fare: 0 },
                { type: "end", location: "Choba Gate (UNIPORT)", instruction: "Final destination. Cross the road carefully to enter the university.", vehicle: "None", fare: 0 }
            ])
        },
        {
            route_title: "Waterlines to Mile 1 Market",
            start_location: "Waterlines",
            vehicle_type_used: "Taxi, Bus",
            fare_price_range_min: 250,
            fare_price_range_max: 300,
            estimated_travel_time_min: 20,
            estimated_travel_time_max: 35,
            difficulty_level: 'Easy',
            status: 'approved',
            stops_along_the_way: JSON.stringify([
                { type: "start", location: "Waterlines Junction", instruction: "Wave down a taxi or board a bus heading to Mile 1/Town.", vehicle: "Taxi", fare: 250 },
                { type: "stop", location: "Garrison Junction", instruction: "Straight down Aba Road.", vehicle: "Taxi", fare: 0 },
                { type: "stop", location: "Isaac Boro Park", instruction: "Keep heading straight.", vehicle: "Taxi", fare: 0 },
                { type: "end", location: "Mile 1 Market (Ikwerre Road)", instruction: "Drop at the flyover or market entrance.", vehicle: "None", fare: 0 }
            ])
        },
        {
            route_title: "Slaughter to Garrison",
            start_location: "Slaughter",
            vehicle_type_used: "Bus, Keke",
            fare_price_range_min: 200,
            fare_price_range_max: 250,
            estimated_travel_time_min: 15,
            estimated_travel_time_max: 25,
            difficulty_level: 'Easy',
            status: 'approved',
            stops_along_the_way: JSON.stringify([
                { type: "start", location: "Slaughter Trans-Amadi", instruction: "Take a Keke or Bus heading to Garrison.", vehicle: "Keke", fare: 200 },
                { type: "stop", location: "Market Junction", instruction: "Pass through Trans-Amadi industrial layout.", vehicle: "Keke", fare: 0 },
                { type: "end", location: "Garrison", instruction: "Drop at the main Aba Road intersection.", vehicle: "None", fare: 0 }
            ])
        },
        {
            route_title: "Eleme Junction to Oil Mill Market",
            start_location: "Eleme Junction",
            vehicle_type_used: "Bus",
            fare_price_range_min: 150,
            fare_price_range_max: 200,
            estimated_travel_time_min: 10,
            estimated_travel_time_max: 20,
            difficulty_level: 'Easy',
            status: 'approved',
            stops_along_the_way: JSON.stringify([
                { type: "start", location: "Eleme Junction (Aba Road)", instruction: "Enter a coaster or mini-bus heading to Oyigbo/Oil Mill.", vehicle: "Bus", fare: 150 },
                { type: "end", location: "Oil Mill Market", instruction: "Drop before the flyover to access the market.", vehicle: "None", fare: 0 }
            ])
        },
        {
            route_title: "Rumuokoro to Mile 3 Market",
            start_location: "Rumuokoro",
            vehicle_type_used: "Bus",
            fare_price_range_min: 300,
            fare_price_range_max: 400,
            estimated_travel_time_min: 30,
            estimated_travel_time_max: 50,
            difficulty_level: 'Moderate',
            status: 'approved',
            stops_along_the_way: JSON.stringify([
                { type: "start", location: "Rumuokoro Park", instruction: "Board a bus shouting 'Mile 3/Diobu'.", vehicle: "Bus", fare: 300 },
                { type: "stop", location: "Agip Junction", instruction: "Straight down Ikwerre Road.", vehicle: "Bus", fare: 0 },
                { type: "stop", location: "UST (RSU) Roundabout", instruction: "Keep moving down.", vehicle: "Bus", fare: 0 },
                { type: "end", location: "Mile 3 Market", instruction: "Alight near the education bus stop.", vehicle: "None", fare: 0 }
            ])
        },
        {
            route_title: "Artillery to Rumuodara",
            start_location: "Artillery",
            vehicle_type_used: "Taxi, Bus",
            fare_price_range_min: 200,
            fare_price_range_max: 250,
            estimated_travel_time_min: 15,
            estimated_travel_time_max: 30,
            difficulty_level: 'Easy',
            status: 'approved',
            stops_along_the_way: JSON.stringify([
                { type: "start", location: "Artillery Junction", instruction: "Enter a taxi heading towards Rumuokoro.", vehicle: "Taxi", fare: 200 },
                { type: "stop", location: "Okporo Road", instruction: "Straight down the Aba-PH expressway.", vehicle: "Taxi", fare: 0 },
                { type: "end", location: "Rumuodara Junction", instruction: "Drop at the intersection.", vehicle: "None", fare: 0 }
            ])
        },
        {
            route_title: "Choba to Mile 1",
            start_location: "Choba",
            vehicle_type_used: "Bus",
            fare_price_range_min: 400,
            fare_price_range_max: 500,
            estimated_travel_time_min: 45,
            estimated_travel_time_max: 70,
            difficulty_level: 'Challenging',
            status: 'approved',
            stops_along_the_way: JSON.stringify([
                { type: "start", location: "Choba (UNIPORT)", instruction: "Take a bus going straight to Mile 1.", vehicle: "Bus", fare: 400 },
                { type: "stop", location: "Rumuokoro", instruction: "Pass through Rumuokoro without dropping.", vehicle: "Bus", fare: 0 },
                { type: "stop", location: "Ikwerre Road", instruction: "Travel down Ikwerre Road.", vehicle: "Bus", fare: 0 },
                { type: "end", location: "Mile 1 flyover", instruction: "Final stop.", vehicle: "None", fare: 0 }
            ])
        },
        {
            route_title: "Eliozu to Rumuokoro",
            start_location: "G.U Ake Road (Eliozu)",
            vehicle_type_used: "Keke",
            fare_price_range_min: 150,
            fare_price_range_max: 200,
            estimated_travel_time_min: 10,
            estimated_travel_time_max: 20,
            difficulty_level: 'Easy',
            status: 'approved',
            stops_along_the_way: JSON.stringify([
                { type: "start", location: "Eliozu Flyover", instruction: "Take a Keke going to Rumuokoro.", vehicle: "Keke", fare: 150 },
                { type: "end", location: "Rumuokoro", instruction: "Drop at the roundabout.", vehicle: "None", fare: 0 }
            ])
        },
        {
            route_title: "Peter Odili Road to Garrison",
            start_location: "Peter Odili Road",
            vehicle_type_used: "Keke, Taxi",
            fare_price_range_min: 300,
            fare_price_range_max: 400,
            estimated_travel_time_min: 20,
            estimated_travel_time_max: 35,
            difficulty_level: 'Moderate',
            status: 'approved',
            stops_along_the_way: JSON.stringify([
                { type: "start", location: "Trans-Amadi / Peter Odili", instruction: "Take a Keke to Slaughter.", vehicle: "Keke", fare: 150 },
                { type: "switch", location: "Slaughter", instruction: "Cross and take another Keke/Taxi to Garrison.", vehicle: "Taxi", fare: 150 },
                { type: "end", location: "Garrison", instruction: "Arrive at Aba Road.", vehicle: "None", fare: 0 }
            ])
        },
        {
            route_title: "Aggrey Road to Mile 1",
            start_location: "Town (Aggrey Road)",
            vehicle_type_used: "Bus, Taxi",
            fare_price_range_min: 150,
            fare_price_range_max: 200,
            estimated_travel_time_min: 10,
            estimated_travel_time_max: 20,
            difficulty_level: 'Easy',
            status: 'approved',
            stops_along_the_way: JSON.stringify([
                { type: "start", location: "Aggrey Road", instruction: "Enter bus or taxi heading to Mile 1/Diobu.", vehicle: "Bus", fare: 150 },
                { type: "stop", location: "Lagos Bus Stop", instruction: "Keep straight.", vehicle: "Bus", fare: 0 },
                { type: "end", location: "Mile 1 Market", instruction: "Drop near the post office.", vehicle: "None", fare: 0 }
            ])
        },
        // We'll map the rest succinctly to keep the file valid but updated
        {
            route_title: "Borokiri to Waterlines",
            start_location: "Town (Borokiri)",
            vehicle_type_used: "Taxi, Bus",
            fare_price_range_min: 300,
            fare_price_range_max: 400,
            estimated_travel_time_min: 25,
            estimated_travel_time_max: 45,
            difficulty_level: 'Moderate',
            status: 'approved',
            stops_along_the_way: JSON.stringify([
                { type: "start", location: "Borokiri Sandfilled", instruction: "Take a bus/taxi heading to Garrison/Waterlines.", vehicle: "Taxi", fare: 300 },
                { type: "stop", location: "Aggrey Road", instruction: "Pass through town.", vehicle: "Taxi", fare: 0 },
                { type: "stop", location: "UTC Junction", instruction: "Turn onto Azikiwe road.", vehicle: "Taxi", fare: 0 },
                { type: "end", location: "Waterlines", instruction: "Drop off on Aba Road.", vehicle: "None", fare: 0 }
            ])
        },
        {
            route_title: "Ogbunabali to Mile 1",
            start_location: "Ogbunabali",
            vehicle_type_used: "Keke",
            fare_price_range_min: 200,
            fare_price_range_max: 250,
            estimated_travel_time_min: 15,
            estimated_travel_time_max: 25,
            difficulty_level: 'Easy',
            status: 'approved',
            stops_along_the_way: JSON.stringify([
                { type: "start", location: "Ogbunabali Road", instruction: "Take a Keke heading to Station/Mile 1.", vehicle: "Keke", fare: 200 },
                { type: "stop", location: "Garrison", instruction: "Cross Aba Road.", vehicle: "Keke", fare: 0 },
                { type: "end", location: "Mile 1 Park", instruction: "End journey.", vehicle: "None", fare: 0 }
            ])
        },
        {
            route_title: "Igwuruta to Rumuokoro",
            start_location: "Igwuruta",
            vehicle_type_used: "Bus, Taxi",
            fare_price_range_min: 300,
            fare_price_range_max: 400,
            estimated_travel_time_min: 25,
            estimated_travel_time_max: 45,
            difficulty_level: 'Moderate',
            status: 'approved',
            stops_along_the_way: JSON.stringify([
                { type: "start", location: "Igwuruta Roundabout", instruction: "Take a bus going to Rumuokoro.", vehicle: "Bus", fare: 300 },
                { type: "stop", location: "Airforce Junction", instruction: "Pass through Airport road.", vehicle: "Bus", fare: 0 },
                { type: "end", location: "Rumuokoro Park", instruction: "Final stop.", vehicle: "None", fare: 0 }
            ])
        },
        {
            route_title: "Rukpokwu to Rumuokoro",
            start_location: "Rukpokwu",
            vehicle_type_used: "Bus, Keke",
            fare_price_range_min: 200,
            fare_price_range_max: 250,
            estimated_travel_time_min: 15,
            estimated_travel_time_max: 30,
            difficulty_level: 'Easy',
            status: 'approved',
            stops_along_the_way: JSON.stringify([
                { type: "start", location: "Rukpokwu Junction", instruction: "Board Keke or Bus to Rumuokoro.", vehicle: "Keke", fare: 200 },
                { type: "end", location: "Rumuokoro", instruction: "Drop at roundabout.", vehicle: "None", fare: 0 }
            ])
        },
        {
            route_title: "Oyigbo to Eleme Junction",
            start_location: "Oyigbo",
            vehicle_type_used: "Bus",
            fare_price_range_min: 300,
            fare_price_range_max: 400,
            estimated_travel_time_min: 25,
            estimated_travel_time_max: 45,
            difficulty_level: 'Moderate',
            status: 'approved',
            stops_along_the_way: JSON.stringify([
                { type: "start", location: "Oyigbo Express", instruction: "Take a bus heading to Eleme/PH.", vehicle: "Bus", fare: 300 },
                { type: "stop", location: "Iriebe", instruction: "Pass through along Aba Road.", vehicle: "Bus", fare: 0 },
                { type: "end", location: "Eleme Junction", instruction: "Drop at the flyover.", vehicle: "None", fare: 0 }
            ])
        },
        {
            route_title: "Woji to Artillery",
            start_location: "Woji",
            vehicle_type_used: "Keke",
            fare_price_range_min: 150,
            fare_price_range_max: 200,
            estimated_travel_time_min: 10,
            estimated_travel_time_max: 25,
            difficulty_level: 'Easy',
            status: 'approved',
            stops_along_the_way: JSON.stringify([
                { type: "start", location: "Woji Estate", instruction: "Take a Keke straight to Artillery.", vehicle: "Keke", fare: 150 },
                { type: "stop", location: "YKC Junction", instruction: "Pass through Woji road.", vehicle: "Keke", fare: 0 },
                { type: "end", location: "Artillery (Aba Road)", instruction: "Drop off.", vehicle: "None", fare: 0 }
            ])
        },
        {
            route_title: "Location to Agip",
            start_location: "Ada George",
            vehicle_type_used: "Keke",
            fare_price_range_min: 150,
            fare_price_range_max: 200,
            estimated_travel_time_min: 10,
            estimated_travel_time_max: 20,
            difficulty_level: 'Easy',
            status: 'approved',
            stops_along_the_way: JSON.stringify([
                { type: "start", location: "Location Junction", instruction: "Take Keke going to Agip.", vehicle: "Keke", fare: 150 },
                { type: "end", location: "Agip Junction", instruction: "Drop off.", vehicle: "None", fare: 0 }
            ])
        },
        {
            route_title: "Agip to Mile 3",
            start_location: "Agip",
            vehicle_type_used: "Bus, Taxi",
            fare_price_range_min: 150,
            fare_price_range_max: 200,
            estimated_travel_time_min: 10,
            estimated_travel_time_max: 25,
            difficulty_level: 'Easy',
            status: 'approved',
            stops_along_the_way: JSON.stringify([
                { type: "start", location: "Agip Flyover", instruction: "Board a bus heading to Mile 3.", vehicle: "Bus", fare: 150 },
                { type: "end", location: "Mile 3 Park", instruction: "Drop off.", vehicle: "None", fare: 0 }
            ])
        },
        {
            route_title: "Mile 1 to D-Line",
            start_location: "Diobu (Mile 1)",
            vehicle_type_used: "Keke",
            fare_price_range_min: 150,
            fare_price_range_max: 200,
            estimated_travel_time_min: 10,
            estimated_travel_time_max: 20,
            difficulty_level: 'Easy',
            status: 'approved',
            stops_along_the_way: JSON.stringify([
                { type: "start", location: "Mile 1 Market", instruction: "Take a Keke heading to D-Line/Garrison.", vehicle: "Keke", fare: 150 },
                { type: "stop", location: "Olu Obasanjo Road", instruction: "Pass through the major road.", vehicle: "Keke", fare: 0 },
                { type: "end", location: "D-Line", instruction: "Drop at your specific street.", vehicle: "None", fare: 0 }
            ])
        },
        {
            route_title: "UST to Mile 1",
            start_location: "UST (RSU)",
            vehicle_type_used: "Taxi, Bus",
            fare_price_range_min: 200,
            fare_price_range_max: 250,
            estimated_travel_time_min: 15,
            estimated_travel_time_max: 30,
            difficulty_level: 'Easy',
            status: 'approved',
            stops_along_the_way: JSON.stringify([
                { type: "start", location: "RSU Main Gate", instruction: "Board a taxi going to Mile 1.", vehicle: "Taxi", fare: 200 },
                { type: "stop", location: "Ikwerre Road", instruction: "Turn onto the main road.", vehicle: "Taxi", fare: 0 },
                { type: "end", location: "Mile 1 Flyover", instruction: "Final stop.", vehicle: "None", fare: 0 }
            ])
        },
        {
            route_title: "Choba to Town (Borokiri)",
            start_location: "Choba",
            vehicle_type_used: "Bus, Taxi",
            fare_price_range_min: 600,
            fare_price_range_max: 800,
            estimated_travel_time_min: 60,
            estimated_travel_time_max: 90,
            difficulty_level: 'Challenging',
            status: 'approved',
            stops_along_the_way: JSON.stringify([
                { type: "start", location: "Choba Gate", instruction: "Take a bus going to Mile 1.", vehicle: "Bus", fare: 400 },
                { type: "switch", location: "Mile 1 Park", instruction: "Drop and cross the road to take a bus/taxi to Town/Borokiri.", vehicle: "Bus", fare: 200 },
                { type: "stop", location: "Aggrey Road", instruction: "Pass through main town.", vehicle: "Bus", fare: 0 },
                { type: "end", location: "Borokiri Sandfilled", instruction: "Final destination.", vehicle: "None", fare: 0 }
            ])
        },
        {
            route_title: "Aluu to Rumuokoro",
            start_location: "Aluu",
            vehicle_type_used: "Bus, Bike",
            fare_price_range_min: 300,
            fare_price_range_max: 500,
            estimated_travel_time_min: 25,
            estimated_travel_time_max: 45,
            difficulty_level: 'Moderate',
            status: 'approved',
            stops_along_the_way: JSON.stringify([
                { type: "start", location: "Aluu Junction/Market", instruction: "Board a bus heading to Rumuokoro.", vehicle: "Bus", fare: 300 },
                { type: "stop", location: "Ozuoba", instruction: "Straight down.", vehicle: "Bus", fare: 0 },
                { type: "end", location: "Rumuokoro", instruction: "Drop off.", vehicle: "None", fare: 0 }
            ])
        },
        {
            route_title: "Ozuoba to Mile 3",
            start_location: "Ozuoba",
            vehicle_type_used: "Taxi, Bus",
            fare_price_range_min: 300,
            fare_price_range_max: 400,
            estimated_travel_time_min: 25,
            estimated_travel_time_max: 40,
            difficulty_level: 'Moderate',
            status: 'approved',
            stops_along_the_way: JSON.stringify([
                { type: "start", location: "Ozuoba Junction", instruction: "Take a taxi direct to Mile 3.", vehicle: "Taxi", fare: 300 },
                { type: "stop", location: "Agip", instruction: "Straight down NTA road onto Ikwerre road.", vehicle: "Taxi", fare: 0 },
                { type: "end", location: "Mile 3 Market", instruction: "Drop off.", vehicle: "None", fare: 0 }
            ])
        },
        {
            route_title: "Abuloma to Waterlines",
            start_location: "Abuloma",
            vehicle_type_used: "Keke, Taxi",
            fare_price_range_min: 400,
            fare_price_range_max: 500,
            estimated_travel_time_min: 30,
            estimated_travel_time_max: 55,
            difficulty_level: 'Moderate',
            status: 'approved',
            stops_along_the_way: JSON.stringify([
                { type: "start", location: "Abuloma Jetty", instruction: "Take a Keke to Slaughter or Peter Odili.", vehicle: "Keke", fare: 150 },
                { type: "switch", location: "Slaughter", instruction: "Take a taxi heading to Waterlines/Aba Road.", vehicle: "Taxi", fare: 250 },
                { type: "end", location: "Waterlines", instruction: "Drop off.", vehicle: "None", fare: 0 }
            ])
        },
        {
            route_title: "Odili Road to Mile 1",
            start_location: "Odili Road",
            vehicle_type_used: "Taxi",
            fare_price_range_min: 400,
            fare_price_range_max: 550,
            estimated_travel_time_min: 30,
            estimated_travel_time_max: 50,
            difficulty_level: 'Moderate',
            status: 'approved',
            stops_along_the_way: JSON.stringify([
                { type: "start", location: "Odili Road (Abacha Road junction)", instruction: "Take a taxi heading straight to Town/Mile 1.", vehicle: "Taxi", fare: 400 },
                { type: "stop", location: "UTC", instruction: "Pass through UTC junction.", vehicle: "Taxi", fare: 0 },
                { type: "end", location: "Mile 1", instruction: "Drop off.", vehicle: "None", fare: 0 }
            ])
        },
        {
            route_title: "Rumukwurushi (Tank) to Rumuokoro",
            start_location: "Rumukwurushi (Tank)",
            vehicle_type_used: "Bus",
            fare_price_range_min: 250,
            fare_price_range_max: 300,
            estimated_travel_time_min: 20,
            estimated_travel_time_max: 35,
            difficulty_level: 'Easy',
            status: 'approved',
            stops_along_the_way: JSON.stringify([
                { type: "start", location: "Tank Junction", instruction: "Board a Bus going to Rumuokoro.", vehicle: "Bus", fare: 250 },
                { type: "stop", location: "Rumuodara", instruction: "Pass the flyover.", vehicle: "Bus", fare: 0 },
                { type: "end", location: "Rumuokoro", instruction: "Drop off.", vehicle: "None", fare: 0 }
            ])
        },
        {
            route_title: "Elelenwo to Waterlines",
            start_location: "Elelenwo",
            vehicle_type_used: "Bus",
            fare_price_range_min: 300,
            fare_price_range_max: 350,
            estimated_travel_time_min: 30,
            estimated_travel_time_max: 50,
            difficulty_level: 'Moderate',
            status: 'approved',
            stops_along_the_way: JSON.stringify([
                { type: "start", location: "Elelenwo Junction", instruction: "Take a bus heading to Waterlines/PH.", vehicle: "Bus", fare: 300 },
                { type: "stop", location: "Artillery", instruction: "Pass through Aba Road.", vehicle: "Bus", fare: 0 },
                { type: "end", location: "Waterlines", instruction: "Drop off.", vehicle: "None", fare: 0 }
            ])
        },
        {
            route_title: "Bori Camp to Mile 3",
            start_location: "Bori Camp (Army Barracks)",
            vehicle_type_used: "Taxi, Keke",
            fare_price_range_min: 200,
            fare_price_range_max: 300,
            estimated_travel_time_min: 15,
            estimated_travel_time_max: 30,
            difficulty_level: 'Easy',
            status: 'approved',
            stops_along_the_way: JSON.stringify([
                { type: "start", location: "Bori Camp Gate", instruction: "Take a Keke or Taxi to Mile 3.", vehicle: "Taxi", fare: 200 },
                { type: "stop", location: "Ikwerre Road", instruction: "Turn onto Ikwerre Road.", vehicle: "Taxi", fare: 0 },
                { type: "end", location: "Mile 3", instruction: "Drop off.", vehicle: "None", fare: 0 }
            ])
        },
        {
            route_title: "Rumuola to Garrison",
            start_location: "Rumuola",
            vehicle_type_used: "Bus, Taxi",
            fare_price_range_min: 150,
            fare_price_range_max: 200,
            estimated_travel_time_min: 15,
            estimated_travel_time_max: 30,
            difficulty_level: 'Easy',
            status: 'approved',
            stops_along_the_way: JSON.stringify([
                { type: "start", location: "Rumuola Flyover", instruction: "Take bus/taxi to Garrison.", vehicle: "Bus", fare: 150 },
                { type: "stop", location: "Waterlines", instruction: "Pass straight.", vehicle: "Bus", fare: 0 },
                { type: "end", location: "Garrison", instruction: "Drop off.", vehicle: "None", fare: 0 }
            ])
        },
        {
            route_title: "Rumuola to Agip",
            start_location: "Rumuola",
            vehicle_type_used: "Keke",
            fare_price_range_min: 200,
            fare_price_range_max: 300,
            estimated_travel_time_min: 20,
            estimated_travel_time_max: 35,
            difficulty_level: 'Moderate',
            status: 'approved',
            stops_along_the_way: JSON.stringify([
                { type: "start", location: "Rumuola Market", instruction: "Take a Keke straight down Rumuola road to Agip.", vehicle: "Keke", fare: 200 },
                { type: "stop", location: "Rumuokwuta", instruction: "Pass through Rumuokwuta junction.", vehicle: "Keke", fare: 0 },
                { type: "end", location: "Agip", instruction: "Drop off.", vehicle: "None", fare: 0 }
            ])
        },
        {
            route_title: "GRA Phase 2 to Mile 1",
            start_location: "GRA Phase 2",
            vehicle_type_used: "Taxi",
            fare_price_range_min: 300,
            fare_price_range_max: 500,
            estimated_travel_time_min: 15,
            estimated_travel_time_max: 40,
            difficulty_level: 'Moderate',
            status: 'approved',
            stops_along_the_way: JSON.stringify([
                { type: "start", location: "Tombia Street", instruction: "Take a taxi heading to Mile 1.", vehicle: "Taxi", fare: 300 },
                { type: "stop", location: "Olu Obasanjo Road", instruction: "Pass through.", vehicle: "Taxi", fare: 0 },
                { type: "end", location: "Mile 1", instruction: "Drop off.", vehicle: "None", fare: 0 }
            ])
        },
        {
            route_title: "Eagle Island to Mile 3",
            start_location: "Eagle Island",
            vehicle_type_used: "Keke",
            fare_price_range_min: 150,
            fare_price_range_max: 200,
            estimated_travel_time_min: 10,
            estimated_travel_time_max: 20,
            difficulty_level: 'Easy',
            status: 'approved',
            stops_along_the_way: JSON.stringify([
                { type: "start", location: "Eagle Island Gate", instruction: "Take a Keke straight to Mile 3/Illabouchi.", vehicle: "Keke", fare: 150 },
                { type: "stop", location: "Illabouchi Road", instruction: "Pass through.", vehicle: "Keke", fare: 0 },
                { type: "end", location: "Mile 3", instruction: "Drop off.", vehicle: "None", fare: 0 }
            ])
        },
        {
            route_title: "Timber to Rumuokoro",
            start_location: "Timber (Mile 3)",
            vehicle_type_used: "Bus",
            fare_price_range_min: 250,
            fare_price_range_max: 350,
            estimated_travel_time_min: 25,
            estimated_travel_time_max: 45,
            difficulty_level: 'Moderate',
            status: 'approved',
            stops_along_the_way: JSON.stringify([
                { type: "start", location: "Timber Market/Illabouchi", instruction: "Walk to Ikwerre road and board a bus to Rumuokoro.", vehicle: "Bus", fare: 250 },
                { type: "stop", location: "Agip / RSU", instruction: "Pass through.", vehicle: "Bus", fare: 0 },
                { type: "end", location: "Rumuokoro", instruction: "Drop off.", vehicle: "None", fare: 0 }
            ])
        },
        {
            route_title: "Town (UTC) to Rumuola",
            start_location: "Town (UTC)",
            vehicle_type_used: "Taxi, Bus",
            fare_price_range_min: 250,
            fare_price_range_max: 350,
            estimated_travel_time_min: 20,
            estimated_travel_time_max: 40,
            difficulty_level: 'Moderate',
            status: 'approved',
            stops_along_the_way: JSON.stringify([
                { type: "start", location: "UTC Junction", instruction: "Take taxi to Rumuola.", vehicle: "Taxi", fare: 250 },
                { type: "stop", location: "Garrison", instruction: "Pass through Aba Road.", vehicle: "Taxi", fare: 0 },
                { type: "end", location: "Rumuola", instruction: "Drop under the flyover.", vehicle: "None", fare: 0 }
            ])
        },
        {
            route_title: "Wimpey to Rumuola",
            start_location: "Wimpey",
            vehicle_type_used: "Keke",
            fare_price_range_min: 150,
            fare_price_range_max: 200,
            estimated_travel_time_min: 10,
            estimated_travel_time_max: 25,
            difficulty_level: 'Easy',
            status: 'approved',
            stops_along_the_way: JSON.stringify([
                { type: "start", location: "Wimpey Junction", instruction: "Take a Keke straight to Rumuola.", vehicle: "Keke", fare: 150 },
                { type: "stop", location: "Rumuokwuta", instruction: "Pass through.", vehicle: "Keke", fare: 0 },
                { type: "end", location: "Rumuola", instruction: "Drop off.", vehicle: "None", fare: 0 }
            ])
        },
        {
            route_title: "Bori to Eleme Junction",
            start_location: "Bori (Ogoni)",
            vehicle_type_used: "Bus",
            fare_price_range_min: 1000,
            fare_price_range_max: 1500,
            estimated_travel_time_min: 45,
            estimated_travel_time_max: 90,
            difficulty_level: 'Challenging',
            status: 'approved',
            stops_along_the_way: JSON.stringify([
                { type: "start", location: "Bori Park", instruction: "Take an interstate/suburban bus to Port Harcourt.", vehicle: "Bus", fare: 1000 },
                { type: "stop", location: "Eleme / Akpajo", instruction: "Pass through.", vehicle: "Bus", fare: 0 },
                { type: "end", location: "Eleme Junction Flyover", instruction: "Final Drop off.", vehicle: "None", fare: 0 }
            ])
        },
        {
            route_title: "Chokocho to Igwuruta",
            start_location: "Chokocho (Etche)",
            vehicle_type_used: "Bus, Keke",
            fare_price_range_min: 400,
            fare_price_range_max: 500,
            estimated_travel_time_min: 20,
            estimated_travel_time_max: 35,
            difficulty_level: 'Moderate',
            status: 'approved',
            stops_along_the_way: JSON.stringify([
                { type: "start", location: "Chokocho Bridge", instruction: "Take bus to Igwuruta.", vehicle: "Bus", fare: 400 },
                { type: "end", location: "Igwuruta Roundabout", instruction: "Drop off.", vehicle: "None", fare: 0 }
            ])
        },
        {
            route_title: "Eleme Junction to Rumuokoro",
            start_location: "Eleme Junction",
            vehicle_type_used: "Bus",
            fare_price_range_min: 400,
            fare_price_range_max: 500,
            estimated_travel_time_min: 35,
            estimated_travel_time_max: 60,
            difficulty_level: 'Moderate',
            status: 'approved',
            stops_along_the_way: JSON.stringify([
                { type: "start", location: "Eleme Junction", instruction: "Take a coaster bus directly to Rumuokoro.", vehicle: "Bus", fare: 400 },
                { type: "stop", location: "Waterlines/Garrison", instruction: "Pass all the way down Aba Road.", vehicle: "Bus", fare: 0 },
                { type: "end", location: "Rumuokoro Flyover", instruction: "Drop off.", vehicle: "None", fare: 0 }
            ])
        },
        {
            route_title: "Location to Choba",
            start_location: "Location (Ada George)",
            vehicle_type_used: "Taxi, Keke",
            fare_price_range_min: 300,
            fare_price_range_max: 400,
            estimated_travel_time_min: 25,
            estimated_travel_time_max: 45,
            difficulty_level: 'Moderate',
            status: 'approved',
            stops_along_the_way: JSON.stringify([
                { type: "start", location: "Location Junction", instruction: "Take a Keke to Ozuoba.", vehicle: "Keke", fare: 150 },
                { type: "switch", location: "Ozuoba", instruction: "Take another Keke or Taxi to Choba.", vehicle: "Keke", fare: 150 },
                { type: "end", location: "Choba", instruction: "Drop off.", vehicle: "None", fare: 0 }
            ])
        },
        {
            route_title: "Rumuodara to Ogbunabali",
            start_location: "Rumuodara",
            vehicle_type_used: "Taxi",
            fare_price_range_min: 350,
            fare_price_range_max: 450,
            estimated_travel_time_min: 25,
            estimated_travel_time_max: 50,
            difficulty_level: 'Moderate',
            status: 'approved',
            stops_along_the_way: JSON.stringify([
                { type: "start", location: "Rumuodara Junction", instruction: "Take a taxi heading to Garrison/Ogbunabali.", vehicle: "Taxi", fare: 350 },
                { type: "stop", location: "Aba Road", instruction: "Pass straight down.", vehicle: "Taxi", fare: 0 },
                { type: "end", location: "Ogbunabali", instruction: "Drop inside Ogbunabali.", vehicle: "None", fare: 0 }
            ])
        }
    ];

    try {
        const { data, error } = await supabase
            .from('routes')
            .insert(routes);

        if (error) throw error;
        return NextResponse.json({ success: true, message: `Inserted ${routes.length} routes successfully!` });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

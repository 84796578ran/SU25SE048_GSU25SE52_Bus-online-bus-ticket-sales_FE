import { gql } from '@apollo/client';
export const SEARCH_TRIPS = gql`
   {
    searchTrips(
      FromLocation: $FromLocation
      EndLocation: $EndLocation
      price: $price
      timeStart: $timeStart
      timeEnd: $timeEnd
    ) {
      id
      TripID
      timeStart
      timeEnd
      FromLocation
      EndLocation
      price
    }
  }
`;
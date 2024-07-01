import AvailabilityCalendar from "../components/AvailabilityCalendar"

export function Profile() {
    return (
        <AvailabilityCalendar 
            days={["SUN", "MON", "THU", "FRI", "SAT"]}
            times={[9, 10, 11, 12, 13, 14, 15, 16, 17]}
        />
    );
}

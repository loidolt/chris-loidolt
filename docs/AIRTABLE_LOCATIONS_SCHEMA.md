# Airtable Locations Schema Guide

This guide outlines the complete schema for the **Locations** table in Airtable. This table powers the GIS map feature and supports tracking vacation spots, hiking trails, campgrounds, fishing spots, hunting spots, airports, and more.

## Quick Start

### Minimum Required Fields

To get started quickly, create these essential fields:

| Field Name | Type | Options | Required |
|------------|------|---------|----------|
| Name | Single line text | - | ✓ |
| Latitude | Number (decimal) | Precision: 6 decimals | ✓ |
| Longitude | Number (decimal) | Precision: 6 decimals | ✓ |
| Status | Single select | Published, Draft, Archived | ✓ |
| Privacy | Single select | Public, Private | ✓ |
| Categories | Multiple select | See category list below | ✓ |

Add other fields as needed based on your use case.

---

## Complete Schema

### 1. Core Identification

| Field Name | Type | Description | Required | Default |
|------------|------|-------------|----------|---------|
| **Name** | Single line text | Location name (e.g., "Grand Canyon North Rim") | ✓ | - |
| **Slug** | Formula or Single line text | URL-friendly identifier (optional, auto-generated from Name) | | - |
| **Status** | Single select | Publication status | ✓ | Draft |
| **Privacy** | Single select | Visibility setting | ✓ | Public |
| **Password** | Single line text | Required password for private locations | | - |

**Status Options:**
- `Published` - Visible on map
- `Draft` - Not visible on map
- `Archived` - Hidden, kept for reference

**Privacy Options:**
- `Public` - Exact location visible to everyone
- `Private` - Location fuzzy on map until password entered

---

### 2. Geographic Coordinates

| Field Name | Type | Description | Required | Example |
|------------|------|-------------|----------|---------|
| **Latitude** | Number (decimal) | Latitude in decimal degrees | ✓ | 37.7749 |
| **Longitude** | Number (decimal) | Longitude in decimal degrees | ✓ | -122.4194 |
| **Elevation** | Number | Elevation in feet | | 8000 |
| **GPS Coordinates** | Single line text | Alternative format (optional) | | N 37° 46.494' W 122° 25.164' |

**Important:**
- Use decimal format for Latitude/Longitude
- Set precision to 6 decimal places for accuracy
- Negative values: West (longitude) and South (latitude)

---

### 3. Categorization & Organization

| Field Name | Type | Description |
|------------|------|-------------|
| **Categories** | Multiple select | Primary classification(s) - can select multiple |
| **Region** | Single select | Geographic region |
| **State/Province** | Single line text | State or province |
| **Country** | Single select | Country |

**Categories Options:**
```
Vacation Spot
Hiking Trail
Backpacking Trail
Campground
Dispersed Camping
Fishing Spot
Hunting Spot
Airport
Backcountry Airstrip
Viewpoint
Scenic Drive
Restaurant
Lodging
Fuel Stop
Emergency Services
Wildlife Viewing Area
Historical Site
Water Source
Trailhead
Parking Area
Hot Spring
Swimming Hole
Rock Climbing
Caving
Boating/Kayaking
Mountain Biking
```

**Region Options:**
```
Pacific Northwest
Southwest
Rocky Mountains
Great Plains
Midwest
Northeast
Southeast
Alaska
Hawaii
Canada West
Canada East
Mexico
```

**Country Options:**
```
USA
Canada
Mexico
```

---

### 4. Content & Media

| Field Name | Type | Description |
|------------|------|-------------|
| **Description** | Long text | Brief description (shows in preview/popup) |
| **Detailed Notes** | Long text (rich text) | Comprehensive information, directions, trip reports |
| **Image** | Attachment | Primary/featured image |
| **Gallery** | Attachment | Additional photos |
| **URL** | URL | External website or resource link |

**Tips:**
- Keep Description concise (1-3 sentences)
- Use Detailed Notes for full trip reports, directions, conditions
- Image shows on map popup when unlocked
- Gallery images can be viewed in detail view

---

### 5. Activity & Trail Details

| Field Name | Type | Description |
|------------|------|-------------|
| **Distance** | Number | Trail length in miles (one-way or loop total) |
| **Difficulty** | Single select | Trail or activity difficulty rating |
| **Trail Type** | Single select | Trail configuration |
| **Activities** | Multiple select | Allowed/suitable activities |

**Difficulty Options:**
```
Easy
Moderate
Difficult
Expert
```

**Trail Type Options:**
```
Loop
Out & Back
Point to Point
```

**Activities Options:**
```
Hiking
Backpacking
Mountain Biking
Horse Riding
ATV/OHV
Motorcycling
Cross-Country Skiing
Snowshoeing
Rock Climbing
```

---

### 6. Camping & Lodging

| Field Name | Type | Description |
|------------|------|-------------|
| **Capacity** | Number | Number of sites/rooms/people |
| **Reservations Required** | Checkbox | Whether reservations needed |
| **Reservation URL** | URL | Link to booking/reservation system |
| **Cost/Fees** | Single line text | Fee information |

**Examples:**
- Cost/Fees: `$25/night`, `$5 day use`, `Free`, `Annual pass required`

---

### 7. Seasonal & Timing

| Field Name | Type | Description |
|------------|------|-------------|
| **Best Season** | Multiple select | Optimal time(s) to visit |
| **Open Dates** | Single line text | When location is accessible |

**Best Season Options:**
```
Spring
Summer
Fall
Winter
```

**Open Dates Examples:**
- `Year-round`
- `May - October`
- `Memorial Day - Labor Day`
- `Weather dependent`

---

### 8. Facilities & Amenities

| Field Name | Type | Description |
|------------|------|-------------|
| **Amenities** | Multiple select | Available facilities and services |

**Amenities Options:**
```
Restrooms
Vault Toilets
Potable Water
Picnic Tables
Fire Rings
Grills
Showers
Electricity Hookups
Water Hookups
Sewer Hookups
Dump Station
Boat Launch
Marina
Parking
Paved Parking
Cell Service
WiFi
Trash Service
Recycling
Firewood Available
Ice Available
Camp Host
```

---

### 9. Access & Logistics

| Field Name | Type | Description |
|------------|------|-------------|
| **Access Type** | Single select | Road/access conditions |
| **Permits Required** | Checkbox | Whether permits are needed |
| **Permit Details** | Long text | Where/how to obtain permits |
| **Directions** | Long text | Detailed access directions from nearest town/highway |

**Access Type Options:**
```
Paved Road
Gravel Road
High Clearance Recommended
4WD Required
Hike-In
Bike-In
Boat-In
Fly-In
```

---

### 10. Personal Tracking

| Field Name | Type | Description |
|------------|------|-------------|
| **Date Visited** | Date | Last visit date |
| **Rating** | Single select | Personal rating |
| **Would Return** | Checkbox | Personal recommendation |
| **Private Notes** | Long text | Personal notes (only visible when location unlocked) |

**Rating Options:**
```
⭐⭐⭐⭐⭐ Exceptional
⭐⭐⭐⭐ Great
⭐⭐⭐ Good
⭐⭐ Fair
⭐ Poor
```

---

### 11. Safety & Warnings

| Field Name | Type | Description |
|------------|------|-------------|
| **Hazards** | Multiple select | Known hazards or risks |
| **Warnings** | Long text | Specific safety information and precautions |

**Hazards Options:**
```
Bears
Rattlesnakes
Mountain Lions
Steep Cliffs
River Crossings
Flash Flood Risk
Avalanche Risk
Extreme Weather
Lightning Risk
Poison Oak/Ivy
No Cell Service
No Water Available
Extreme Heat
Extreme Cold
High Altitude
```

---

### 12. Airport-Specific Fields

*(Optional - only for Airport/Airstrip categories)*

| Field Name | Type | Description |
|------------|------|-------------|
| **Airport Code** | Single line text | ICAO or IATA identifier |
| **Runway Length** | Number | Longest runway in feet |
| **Runway Surface** | Single select | Primary runway surface type |
| **Runway Heading** | Single line text | Primary runway designation (e.g., "09/27") |
| **Fuel Available** | Multiple select | Available fuel types |
| **Airport Type** | Single select | Airport classification |
| **Pattern Altitude** | Number | Traffic pattern altitude MSL |
| **Unicom/CTAF** | Single line text | Radio frequency |

**Runway Surface Options:**
```
Asphalt
Concrete
Gravel
Grass
Dirt
Turf
```

**Fuel Available Options:**
```
100LL
Jet A
Mogas
Self-Serve
Full Service
```

**Airport Type Options:**
```
Public
Private
Military
```

---

### 13. Contact & Emergency Information

| Field Name | Type | Description |
|------------|------|-------------|
| **Contact Name** | Single line text | Managing agency or contact person |
| **Phone** | Phone | Contact phone number |
| **Emergency Services** | Long text | Nearest hospital, ranger station, sheriff, etc. |

---

## Setup Instructions

### Step 1: Create the Table

1. In your Airtable base, create a new table named **"Locations"**
2. Delete the default fields except Name

### Step 2: Add Core Fields

Add these fields first (minimum required):

1. **Name** - Single line text
2. **Latitude** - Number (precision: 6 decimals)
3. **Longitude** - Number (precision: 6 decimals)
4. **Status** - Single select (options: Published, Draft, Archived)
5. **Privacy** - Single select (options: Public, Private)
6. **Categories** - Multiple select (add options from category list above)
7. **Description** - Long text
8. **Image** - Attachment

### Step 3: Add Optional Fields

Add additional fields based on your needs:

- For trails: Add Distance, Difficulty, Trail Type
- For camping: Add Capacity, Amenities, Reservations Required
- For airports: Add Airport Code, Runway Length, Fuel Available
- For all: Consider adding Region, Best Season, Rating

### Step 4: Create Views

Set up these views for easier management:

1. **All Locations** (default)
   - No filters
   - Sort by Name (A → Z)

2. **Published & Public**
   - Filter: Status = "Published" AND Privacy = "Public"

3. **Private Locations**
   - Filter: Privacy = "Private"
   - Shows locked locations

4. **By Category**
   - Group by: Categories
   - Sort by: Name

5. **Recent Visits**
   - Filter: Date Visited is not empty
   - Sort by: Date Visited (newest first)

6. **Needs Photos**
   - Filter: Image is empty AND Status = "Published"

7. **Draft Locations**
   - Filter: Status = "Draft"

---

## Environment Variable Setup

Add this line to your `.env` file:

```bash
AIRTABLE_LOCATIONS_TABLENAME=Locations
```

Make sure you have these existing variables:
```bash
AIRTABLE_API_KEY=your_airtable_api_key
AIRTABLE_POSTS_BASEID=your_base_id
```

---

## Example Records

### Example 1: Public Hiking Trail

```
Name: Devil's Punchbowl Trail
Latitude: 34.4355
Longitude: -117.8475
Status: Published
Privacy: Public
Categories: Hiking Trail, Viewpoint
Description: 1-mile loop through unique rock formations with panoramic views
Distance: 1.2
Difficulty: Easy
Trail Type: Loop
Best Season: Spring, Fall, Winter
Amenities: Restrooms, Parking, Picnic Tables
Access Type: Paved Road
Hazards: Extreme Heat, No Water Available
```

### Example 2: Private Campground

```
Name: Secret Mountain Camp
Latitude: 45.7213
Longitude: -121.5147
Status: Published
Privacy: Private
Password: basecamp2024
Categories: Campground, Dispersed Camping
Description: Remote mountain camp with alpine lake access
Capacity: 4
Best Season: Summer, Fall
Amenities: Fire Rings
Access Type: 4WD Required
Hazards: Bears, No Cell Service
Private Notes: Great fishing in the lake, best sites are on the west shore
```

### Example 3: Backcountry Airstrip

```
Name: Johnson Creek Airstrip
Latitude: 44.9617
Longitude: -115.3681
Status: Published
Privacy: Public
Categories: Airport, Backcountry Airstrip
Description: Remote mountain airstrip in Idaho backcountry
Airport Code: 3U2
Runway Length: 3400
Runway Surface: Grass
Runway Heading: 17/35
Airport Type: Public
Elevation: 4961
Access Type: Fly-In
Hazards: High Altitude, Extreme Weather
Warnings: One-way operations common due to terrain, use extreme caution
```

---

## Tips for Data Entry

1. **Coordinates**: Use Google Maps or a GPS app to get accurate lat/long
   - Right-click on Google Maps → "What's here?" to get coordinates
   - Format should be decimal (e.g., 37.7749, not 37° 46' 29.64")

2. **Privacy Settings**:
   - Use "Private" for sensitive hunting/fishing spots, secret campsites
   - Use "Public" for official trails, campgrounds, public airports

3. **Passwords**:
   - Keep simple and memorable
   - Can use the same password for multiple locations if desired
   - Store passwords securely (consider using a password manager)

4. **Images**:
   - Compress large images before uploading
   - Use landscape orientation for best map popup display
   - Featured image shows on map, gallery for additional photos

5. **Status Workflow**:
   - Start as "Draft" when adding new locations
   - Change to "Published" when ready to show on map
   - Use "Archived" for locations no longer accessible/relevant

---

## Data Migration

If you have existing location data in spreadsheets or other formats:

1. Export to CSV with matching column names
2. In Airtable, use "Import data" → "CSV"
3. Map columns to corresponding fields
4. Review and clean up after import

---

## Maintenance

Regularly update:
- **Date Visited** - Track when you last visited
- **Rating** - Update based on recent experiences
- **Warnings** - Add new hazards or seasonal conditions
- **Image** - Add current photos if conditions have changed
- **Status** - Archive locations that are closed or no longer accessible

---

## Additional Resources

- Airtable Field Types: https://support.airtable.com/docs/field-types-overview
- GPS Coordinates Format: https://en.wikipedia.org/wiki/Decimal_degrees
- Map Privacy Best Practices: Consider privacy implications before sharing exact coordinates

---

*Last Updated: 2025-01-24*

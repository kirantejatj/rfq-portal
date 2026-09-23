import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileCheck, Shield, Building2, Search, Filter, Printer, Download, 
  ChevronDown, ChevronUp, PlusCircle, Copy, Check, Info, ArrowLeft,
  DollarSign, Layers, CheckCircle2, FileText, Sparkles, ExternalLink
} from 'lucide-react';

export const APPROVED_NON_SOR_ITEMS = [
  {
    sno: 1,
    item_code: "Non-SOR-1",
    category: "Civil & Doors",
    name: "Mild Steel Shaft Door (GI Skin-Pass 1.20mm frame / 0.80mm shutter with PUF insulation)",
    description: "Providing and fixing powder coated mild steel shaft door with frame and shutter fabricated from skin-pass galvanized iron sheets conforming to IS:513 (D Quality) and galvanized as per IS:277 with minimum zinc coating of 120 g/sqm. The door frame shall be manufactured from 1.20 mm thick GI sheet, pressed to single rebate profile of size 100 mm x 58 mm and filled with polyurethane foam insulation. The shutter shall be manufactured from 0.80 mm thick GI sheet, forming a 46 mm thick fully flush double skin construction with lock seam joints at stile edges and honeycomb kraft paper core infill. The shutter surface shall be treated with zinc phosphate primer and finished with polyester/epoxy polyester/polyurethane powder coating of approved shade and colour with coating thickness not less than 60-65 microns. The door shall be provided with 6 mm thick clear float vision glass of approved size and shape (circular/square/rectangular), stainless steel ball bearing butt hinges of 3 mm thickness, mortise sash lock with lever handles, mortise dead bolt and all necessary fittings, fixtures, fasteners and accessories complete as directed by the Engineer-in-Charge. The item shall include supply, fabrication, transportation, erection, fixing, finishing and making good the disturbed portions complete in all respects.",
    unit: "Sqm",
    qty: 442,
    rate: 10957,
    amount: 4845843,
    remarks: "The Rate is not available in any Government SoR. Adopted rate is based on market quotations and is lower than the prevailing market rate; hence, the rate is considered reasonable. After evaluation, the adopted quotation rate was found to be the lowest and most reasonable among the available market rates. The rate has already been approved for APCRDA Project office work. Hence the rate was adopted in this work."
  },
  {
    sno: 2,
    item_code: "Non-SOR-2",
    category: "Sports & Infrastructure",
    name: "Basketball Goal Post Set (FIBA Standards, MS Box Section 3-5mm)",
    description: "Providing and fixing in position complete Basketball Goal Post Set conforming to FIBA standards, consisting of heavy duty MS steel pole fabricated from MS pipe/box section of required size and thickness (minimum 3-5 mm), with required projection, including base plate (minimum 12 mm thick), duly primer coated and finished with two or more coats of approved synthetic enamel / powder coating.",
    unit: "No",
    qty: 3,
    rate: 80250,
    amount: 240750,
    remarks: "The Rate is not available in any Government SoR. Adopted rate is based on market quotations and is lower than the prevailing market rate; hence, the rate is considered reasonable. Therefore, three quotations were obtained from reputed suppliers in accordance with procurement procedures. On comparative evaluation, the quotation submitted by Rayzon Global LLP was found to be the lowest and most economical, and the adopted rate is lower than the prevailing market rate. The product conforms to FIBA standards and meets the required technical specifications."
  },
  {
    sno: 3,
    item_code: "Non-SOR-3",
    category: "Flooring & Sports",
    name: "Rubberized Flooring Base 34mm + Top 6mm (IS 809:1992 / IS 1197:1970)",
    description: "Providing and laying rubberized flooring Base coat 34mm , Top Layer 6mm thickness over podium slab top, conforming to IS 809:1992 (Rubber Flooring Materials for General Purposes) and laid as per IS 1197:1970 (Code of Practice for Laying of Rubber Floors), including surface preparation, adhesive, finishing, and all complete as directed by the Engineer-in-Charge and as per CPWD specifications.",
    unit: "Sqm",
    qty: 2900,
    rate: 5191,
    amount: 15052448,
    remarks: "The Rate is not available in any Government SoR. Adopted rate is based on market quotations and is lower than the prevailing market rate; hence, the rate is considered reasonable. Execution of dedicated developments including the Kids' Play Area and Walking Track built directly over the podium slabs at MLA, MLC & AIS Towers."
  },
  {
    sno: 4,
    item_code: "Non-SOR-4",
    category: "False Ceiling",
    name: "PVC Laminated Gyp Board Fine Line Grid False Ceiling for Toilets (600x600mm)",
    description: "Gyp Board Fine Line Grid false ceiling for Toilets - False Ceiling: Supplying and fixing PVC Laminated Gyp Board Fine Line Grid false ceiling (GS-FLC-4.6 as per India Gypsum) in size 600 mm x 600 mm using 8 mm thick/ 9 mm thick Gyp Board sheet tiles of size 595 mm x 595 mm or 595 mm x 1195 mm conforming to IS 2095 - 1982 fixing to Gyp steel precoated GI wall angle of size 24 mm x 24 mm x of 0.40 mm thick along the perimeter of ceiling screw fixed to brick work/ partition at 610 mm c/c and suspending the frame work using precoated GI Tee section (24 mm x 32 mm x 0.3 mm) from soffit at 1220 mm c/c fixed with GI Soffit Cleat, royal plugs and steel expansion fasteners & connecting clip to the GI T section with 4 mm dia GI Rod with galvanized spring steel level clip of PVC universal holding clips system at 1200 mm c/c and fixing the 8 mm / 9 mm PVC Laminated Gyp board Sheet tiles of size 595 mm x 595 mm or 595 mm complete for finished item of work as per India Gypsum Ltd specification.",
    unit: "Sqm",
    qty: 11215,
    rate: 1218,
    amount: 13660105,
    remarks: "The Rate is not available in any Government SoR. Adopted rate is based on market quotations and is lower than the prevailing market rate; hence, the rate is considered reasonable. Executed for Toilets PVC Laminated Gyp Board Fine Line Grid false ceiling. This execution was necessary to prevent future maintenance issues and achieve the required architectural finish. It is requested to approve this supplementary item to clear pending regular billing."
  },
  {
    sno: 5,
    item_code: "Non-SOR-5",
    category: "Expansion Joints",
    name: "Expansion Joint Treatment (Top Horizontal) - BIZZAR 446 050 / INPROCORP",
    description: "EXPANSION JOINT TREATMENT (TOP HORIZONTAL) Supply and Installation of Product BIZZAR 446 050 having grooved Flexible High Quality Elastomeric Inserts. The Inserts should be resistant to oils, acids, bitumen and high temperature resistant (-30°C to + 120°C) for hard weather conditions and is UV stabilized. Expansion Joint covers/ Profile should be Antibacterial and physiologically safe. The system should have solid Aluminum frames in mill finish. The System should be able to withstand a wheel Load of 30 kN for cars and 300kN for lorries, as per DIN 1991 Specifications. The system is designed for 200 mm Joint size, having a total Movement of 5mm of Joint width. The side Profile should have a MULTI HOLE mounting bracket allowing for secure fixing and flexible anchoring and excellent bonding with given slab surface/masonry/epoxy bedding. For Precise Transitions the factory supplied 25-40mm 995416 RMT connection pieces should be used during the installation of the cover system. Approved Make: BIZZAR OR INPROCORP JOINT MASTER.",
    unit: "Rmt",
    qty: 1236,
    rate: 5500,
    amount: 6795965,
    remarks: "The Rate is not available in any Government SoR. Adopted rate is based on market quotations and is lower than the prevailing market rate; hence, the rate is considered reasonable. The original estimate provided for a 200 mm thick Expansion Joint. However, as per the actual site conditions, the Expansion Joint thickness varies from 25 mm to 50 mm only. Hence, the originally estimated item is not required, and the corresponding item has been proposed as a supplementary/deviation item based on actual site requirements."
  },
  {
    sno: 6,
    item_code: "Non-SOR-6",
    category: "Expansion Joints",
    name: "Expansion Joint Treatment (Bottom Horizontal) - BIZZAR 23W-050",
    description: "EXPANSION JOINT TREATMENT (BOTTOM HORIZONTAL) Supply and installation of Product strip model BIZZAR 23W-050 joints width for 25mm to 75mm in accordance with the requirements of the specifications below. The joint covers are designs utilizing extruded aluminum base members of 100mm along with the Snap in Tension Clip System. The material shall be such that it provides an Expansion Joints System suitable for Horizontal Ceiling to Ceiling Flat application. The Joint System shall utilize lightweight aluminum profiles exhibiting minimal exposed aluminum surfaces of 100mm mechanically locking with a specifically designed clip made up of stainless steel to facilitate movement. Throughout the normal movement cycle, the system shall demonstrate the ability to remain flat at all times and provide a flush transition between Opposing and adjacent finish construction BIZZAR or INPROCORP JOINT MASTER.",
    unit: "Rmt",
    qty: 1236,
    rate: 4500,
    amount: 5560335,
    remarks: "The Rate is not available in any Government SoR. Adopted rate is based on market quotations and is lower than the prevailing market rate; hence, the rate is considered reasonable. Proposed as supplementary/deviation item based on actual site requirements."
  },
  {
    sno: 7,
    item_code: "Non-SOR-7",
    category: "Expansion Joints",
    name: "Expansion Joint Treatment (Vertical Internal) - BIZZAR 23W-050",
    description: "EXPANSION JOINT TREATMENT (VERTICAL INTERNAL) Supply and installation of Product strip model BIZZAR 23W-050 joints width for 25mm to 75mm in accordance with the requirements of the specifications below. The joint covers are designs utilizing extruded aluminum base members of 100mm along with the Snap in Tension Clip System. The material shall be such that it provides an Expansion Joints System suitable for Vertical Wall to Wall Flat application. The Joint System shall utilize lightweight aluminum profiles exhibiting minimal exposed aluminum surfaces of 100mm mechanically locking with a specifically designed clip made up of stainless steel to facilitate movement. Throughout the normal movement cycle, the system shall demonstrate the ability to remain flat at all times and provide a flush transition between Opposing and adjacent finish construction BIZZAR or INPROCORP JOINT MASTER.",
    unit: "Rmt",
    qty: 500,
    rate: 3470,
    amount: 1735000,
    remarks: "The Rate is not available in any Government SoR. Adopted rate is based on market quotations and is lower than the prevailing market rate; hence, the rate is considered reasonable. Proposed as supplementary/deviation item based on actual site requirements."
  },
  {
    sno: 8,
    item_code: "Non-SOR-8",
    category: "Expansion Joints",
    name: "Expansion Joint Treatment (Vertical External) - Wall to Wall Hook System",
    description: "EXPANSION JOINT TREATMENT (VERTICAL EXTERNAL) Providing & Fixing of Expansion Joint system related with the WALL to WALL (External) Location as per drawing and direction of engineer-In-Charge. Expansion Joint The design of the Joint Cover System should be such that the system should snap onto a 50mm wide, hook shaped aluminum clip. The system should have gasket seals on the edges to provide scratch protection to the wall finish and prevent accumulation of dust. The system should be in 6063 alloy in clear anodized matt finish. Provision of Moisture Barrier Membrane in the Joint System to have watertight joint is mandatory requirement for all external area as per the manufactures design and as approved by the Engineer-in-Charge, Approved Make: BIZZAR OR INPROCORP JOINT MASTER.",
    unit: "Rmt",
    qty: 500,
    rate: 4590,
    amount: 2295000,
    remarks: "The Rate is not available in any Government SoR. Adopted rate is based on market quotations and is lower than the prevailing market rate; hence, the rate is considered reasonable. Proposed as supplementary/deviation item based on actual site requirements."
  },
  {
    sno: 9,
    item_code: "Non-SOR-9",
    category: "Waterproofing & Grouting",
    name: "PU Foam & Two-Component Resin Injection Grouting (Active Leakage Treatment)",
    description: "Treating Active leakage from Concrete walls Providing and grouting with single component Polyurethane Foam injection grout at dripping leakage locations, grout mixed at ratio of 10:1 (10 parts of Resin: 1 part accelerator) at the rate of 0.40kg/nozzle which will foam after reaction with water/ moisture, cream time <20 seconds, rise time <30 seconds, foam expansion more than 30 times. It has a mixed viscosity of <350 cp as per ASTM D 2196. Allow the PU foam grout to cure for 5 -10 mins. Providing and grouting with two component Polyurethane based resin injection grout mixed at ratio of 2:1 (2 parts of Base: 1 part Hardener) which will injected through same nozzle at the rate of 0.30kg/nozzle which gives Adhesion strength >2.5 MPa, Adhesion in wet concrete >1.5Mpa, Elongation >80%. It has a mixed viscosity of <350 cp as per ASTM D 2196. The finished cost to include surface preparation, fixing of non -return valve injection packers at dripping leakage locations and damp patch locations, seal the nozzles with polyester resin anchor grout Instant leak plug 0.2kg/nozzle. All the application procedures shall be as per the direction of the Engineer In charge.",
    unit: "Nos",
    qty: 14400,
    rate: 1800,
    amount: 25920000,
    remarks: "As per the SoR 2025-26 The rate is Rs. 1989.00, Contract Profit 13.615% Rs. 270.80, Total Cost Rs. 2259.80. Adopted 20% less than total Cost and Rounding off Rs. 1800.00."
  },
  {
    sno: 10,
    item_code: "Non-SOR-10",
    category: "Horticulture & Landscaping",
    name: "Doob Grass Turf Lawn on Podium Slabs (75mm Good Earth Dressing)",
    description: "Providing and laying grass lawn/grass lane with approved variety of grass (doob grass / selection no. 1 or as approved), including preparation of subgrade, dressing, supplying and spreading good earth of average 75 mm thickness, removing weeds, stones, and rubbish, leveling and compacting, planting of grass turf in lines or as directed, watering, rolling, and maintenance for a period of 30 days or till proper establishment of grass, complete as per the direction of the Engineer-in-Charge.",
    unit: "Sqm",
    qty: 3373,
    rate: 550,
    amount: 1855228,
    remarks: "The Rate is not available in any Government SoR. Adopted rate is based on market quotations and is lower than the prevailing market rate; hence, the rate is considered reasonable. Laying of grass lawn/grass turf was executed on the podium tops as part of the landscaping and beautification works, in accordance with the approved landscape drawings and site requirements."
  },
  {
    sno: 11,
    item_code: "Non-SOR-11",
    category: "Civil & Drainage",
    name: "CC 1:2:4 Saucer Drain along Cement Concrete Roads",
    description: "Providing and constructing cement concrete saucer drain of required size and profile in CC 1:2:4 (1 cement : 2 coarse sand : 4 graded stone aggregate of 20 mm nominal size), including excavation in all kinds of soil, dressing and leveling of bed, providing and laying concrete in required slope, finishing the surface smooth with cement mortar 1:2, including curing, disposal of surplus excavated earth within lead up to 50 m, and all complete as per directions of the Engineer-in-Charge.",
    unit: "Rmt",
    qty: 1100,
    rate: 1100,
    amount: 1210000,
    remarks: "The rate was approved in Project Office and PEB Sheds works same rate will consider. Constructing cement concrete saucer drain for along with Cement roads, in accordance with the approved drawings and site requirements. Included as a supplementary item in the working estimate."
  },
  {
    sno: 12,
    item_code: "Non-SOR-12",
    category: "HVAC",
    name: "HVAC IDU Cover Removing, Cleaning Inside Unit, Painting & Refixing",
    description: "HVAC IDU Cover Removing, Cleaning inside the Unit, Cover Painting as per the colour shown & Refixing complete package including all Material & Manpower.",
    unit: "No",
    qty: 450,
    rate: 4200,
    amount: 1890000,
    remarks: "The Rate is not available in any Government SoR. Adopted rate is based on market quotations and is lower than the prevailing market rate; hence, the rate is considered reasonable. The HVAC indoor units installed during the initial phases of the project were found to be in poor, deteriorated condition due to prolonged exposure and site constraints. Corrective Action: comprehensive servicing and localized protective cover painting were carried out on-site."
  },
  {
    sno: 13,
    item_code: "Non-SOR-13",
    category: "Fire Fighting & Plumbing",
    name: "200mm dia CI Y-Strainer for Fire Main Header",
    description: "Supply, installation, testing and commissioning of 200mm dia CI Y strainer.",
    unit: "No",
    qty: 9,
    rate: 60542,
    amount: 544878,
    remarks: "The Rate is not available in any Government SoR. Adopted rate is based on market quotations and is lower than the prevailing market rate; hence, the rate is considered reasonable. Fire Protection Systems: Integrated into large-diameter fire main headers to ensure that debris doesn't clog sprinkler heads or deluge valves during an emergency."
  },
  {
    sno: 14,
    item_code: "Non-SOR-14",
    category: "Fire Fighting & Plumbing",
    name: "100mm dia CI Y-Strainer for Fire Main Line",
    description: "Supply, installation, testing and commissioning of 100mm dia CI Y strainer.",
    unit: "No",
    qty: 9,
    rate: 15798,
    amount: 142182,
    remarks: "The Rate is not available in any Government SoR. Adopted rate is based on market quotations and is lower than the prevailing market rate; hence, the rate is considered reasonable. Fire Protection Systems: Integrated into fire main headers to ensure that debris doesn't clog sprinkler heads or deluge valves during an emergency."
  },
  {
    sno: 15,
    item_code: "Non-SOR-15",
    category: "Fire Fighting & Pumps",
    name: "Diesel Engine Driven Main Fire Pump 2280 LPM @ 120m Head (Kirloskar/Cummins)",
    description: "Replacing and servicing, installation & testing commissioning of existing diesel engine set with suitable required spares installation, Testing and commissioning of diesel engine driven main fire pump suitable for automatic operation and consisting of following: complete in all respect as required a) Horizontal type, multistage, centrifugal pump of cast iron body & bronze impeller with stainless steel shaft, mechanical seal to ensure a minimum pressure of 3.5 Kg / sq.cm. at highest and farthest outlet at specified flow of 2280 lpm at 120 Mtr head conforming to IS 1520 b) Suitable HP, 1500 RPM water cooled with radiator, diesel engine conforming to relevant BS & IS standard complete with auto starting mechanism, 12 Volts / 24 Volts electric starting equipment, Diesel Tank, exhaust pipe extended upto 1 m. outside pump house duty insulated with 50mm thick glass wool with 1.0mm thick aluminum sheet cladding, residential silencer, instruments and protection as per specification, stop solenoid for auto stop in the event of fault with audio indications, painted with post office red colour etc as required. c) M.S. Fabricated common base plate, coupling, coupling guard, foundation bolts etc as required. d) Suitable cement concrete foundation duly plastered with anti-vibration pads. as per technical specifications and as directed by engineer in charge. Makes of Engines: Kirloskar / Cummins. Makes of Pumps: Kirloskar / Mather & Platt.",
    unit: "No",
    qty: 4,
    rate: 526995,
    amount: 2107980,
    remarks: "The rate for the subject item is not available in any Government Schedule of Rates (SoR). Accordingly, the rate has been derived based on market quotations obtained from authorized agencies/manufacturers and verified through comparative market rate analysis. The adopted rate is found to be lower than the prevailing market rate and is therefore considered reasonable, justified, and acceptable. The scope of work involves supply of the required internal spares for the existing diesel engine set, comprehensive retrofitting, specialized mechanical servicing, installation, testing, commissioning, and performance verification, including all incidental charges. Includes comprehensive warranty for a period of two (2) years from the date of successful commissioning."
  },
  {
    sno: 16,
    item_code: "Non-SOR-16",
    category: "Fire Fighting & Pumps",
    name: "Electrical Main Fire Hydrant & Sprinkler Pump 2850 LPM @ 88m Head (415V, TEFC Class F)",
    description: "Replacing and servicing, installation & testing commissioning of existing main electrical pump engine set with suitable required spares installation, testing and commissioning of electrically driven horizontal, single outlet, centrifugal fire hydrant / sprinkler pump, suitable for automatic operation consisting of the following: a) Horizontal, end suction, centrifugal pump, suitable for operation on 415 volts ± 6%, 3 phase, 50 HZ A.C supply. The installation shall be complete with flexible coupling and coupling guard as required. Fire pump shall have C.I. casing, CS diffusers, bronze impeller (hard finished and dynamically balanced) and S.S. (304) Shaft with mechanical seal, capable for delivering 2280 LPM at outlet head of 120 mts. to ensure a minimum pressure of 3.5 Kg/Sqcm at the farthest or topmost hydrant / sprinkler. Pump shall be capable of furnishing not less than 150% of rated discharge at a head of not less than 65% of the rated head. The shut off head shall not exceed 120% of rated head. b) Squirrel cage induction motor, TEFC type suitable for operation on 415 volts, 3 phase 50 HZ A.C supply, for the above pump with synchronous speed of 2900 RPM, conforming to IP 55 protection & class F insulation. The motor shall conform to IS 325-1978 (up to date) with flexible coupling and coupling guard, complete as required) Suitable cement concrete foundation with plaster, complete with antivibration arrangement of cushy foot mountings. MS epoxy painted common base frame for pump complete as required. Flow : 2850LPM Head : 88mwc and as per technical specifications and as directed by engineer in charge.",
    unit: "No",
    qty: 2,
    rate: 715413,
    amount: 1430826,
    remarks: "The rate for the subject item is not available in any Government Schedule of Rates (SoR). Derived based on market quotations obtained from authorized manufacturers and verified through comparative market rate analysis. Includes 2 years comprehensive warranty."
  },
  {
    sno: 17,
    item_code: "Non-SOR-17",
    category: "Fire Fighting & Pumps",
    name: "Vertical Centrifugal Jockey Pressurization Pump (180 LPM @ 120m Head)",
    description: "Replacing and servicing, installation & testing commissioning of existing Jockey pump set with suitable required spares installation, testing and commissioning of jockey pump (pressurization pump) comprising of the following: a) Vertical centrifugal pump, suitable for operation on 415 volts ± 6%, 3 phase, 50 HZ A.C supply. The installation shall be complete with Flexible coupling and coupling guard, complete as required. The pump casing shall be CI, shaft shall be SS & impeller / shaft sleeve / casing wearing ring shall be bronze. The pump shall be provided with mechanical seal .b) Squirrel cage induction motor TEFC type for operation on 415 V, 3 phase 50 HZ AC supply for the above pump with a synchronous speed of 2900 R.P.M. with flexible coupling and coupling guard etc. as required. Flow: 180 LPM Head: 120mts and as per technical specifications and as directed by engineer in charge.",
    unit: "No",
    qty: 2,
    rate: 148945,
    amount: 297890,
    remarks: "Derived based on market quotations obtained from authorized agencies. Reasonable and justified. Comprehensive warranty for a period of two (2) years."
  },
  {
    sno: 18,
    item_code: "Non-SOR-18",
    category: "Structural Core Cutting",
    name: "RCC Core Cutting up to 100mm dia (Wall/Slab Thickness up to 200mm)",
    description: "Core cutting up to 100mm dia in reinforced cement concrete (RCC) work in walls, slabs, beams, columns, etc., of required diameter and depth using diamond core cutting machine, including marking of location, drilling, diamond core drilling for specified diameter for dia 50 to 100mm for Slab/ Wall thickness Upto 200mm including cutting reinforcement, scaffolding, etc, removal of concrete core, disposal of debris within lead up to 50 m, and making good the edges to required finish, complete as per the direction of Engineer-in-Charge.",
    unit: "Each",
    qty: 8766,
    rate: 568,
    amount: 4979088,
    remarks: "The Rate is not available in any Government SoR. Adopted rate is based on market quotations and is lower than the prevailing market rate; hence, the rate is considered reasonable. The structural works were completed earlier without providing openings for sanitary pipelines, HVAC ducts, and other service lines. During execution, it became necessary to cut holes in slabs, beams, and walls to accommodate these services as per site requirements."
  },
  {
    sno: 19,
    item_code: "Non-SOR-19",
    category: "Structural Core Cutting",
    name: "RCC Core Cutting 150mm to 250mm dia (Wall/Slab Thickness up to 200mm)",
    description: "Core cutting From 150mm to 250mm dia in reinforced cement concrete (RCC) work in walls, slabs, beams, columns, etc., of required diameter and depth using diamond core cutting machine, including marking of location, drilling, diamond core drilling for specified diameter for dia 50 to 100mm for Slab/ Wall thickness upto 200mm including cutting reinforcement, scaffolding, etc, removal of concrete core, disposal of debris within lead up to 50 m, and making good the edges to required finish, complete as per the direction of Engineer-in-Charge.",
    unit: "Each",
    qty: 11142,
    rate: 807,
    amount: 8991594,
    remarks: "Required for HVAC ducts, electrical cables, and large drainage sleeves. Rate is lower than prevailing market rates."
  },
  {
    sno: 20,
    item_code: "Non-SOR-20",
    category: "Structural Core Cutting",
    name: "RCC Core Cutting 75mm to 150mm dia (Heavy Slab Thickness 275mm to 500mm)",
    description: "Core cutting From 75mm to 150mm dia in reinforced cement concrete (RCC) work in walls, slabs, beams, columns, etc., of required diameter and depth using diamond core cutting machine, including marking of location, drilling, diamond core drilling for specified diameter for dia 75 to 150mm for Slab thickness from 275mm to 500mm including cutting reinforcement, scaffolding, etc, removal of concrete core, disposal of debris within lead up to 50 m, and making good the edges to required finish, complete as per the direction of Engineer-in-Charge.",
    unit: "Each",
    qty: 6600,
    rate: 1376,
    amount: 9081600,
    remarks: "Deep slab core cutting through heavy transfer slabs and podium slabs. Has been proposed and included in the working estimate."
  },
  {
    sno: 21,
    item_code: "Non-SOR-21",
    category: "Elevators & Lifts",
    name: "Retrofitting & Restoration of Passenger Lifts - Thyssenkrupp G+12 (15 Pass/1020kg, MRL 1.75 mps, ARD, VVVF, CCTV)",
    description: "Retro fitting of passenger lifts Replacing, recondensing, restoring, Installation and testing & commissioning of passenger elevator Electric Traction Passenger Lift of makes: Thyssenkrupp Elevator with Rated capacity :- 15 Passenger/1020Kg Floors :- G+12 floor (13Stops/13 Landings) Travel :- 40-42 mtrs Location of Lift Machine:- MRL Rated speed :- 1.5 to 1.75 mps VS Doors type :- COPO/TOPO Doors with frame having clear opening of 1000/1100 mm wide x 2100 mm high . COP (two panel) with SS face plate having metallic push buttons with Braille Code & luminous indicator around button with FPI, scrolling UP/DN LED indicator & with/without attendant key switch, OWD with audio-visual alarm, VAS in Telugu & English with intercom system with telephone instrument in Lift car, LMR & FCC/ground floor Clear Car size of 1600 mm wide x 1500 mm deep x 2400 mm high. CCTV surveillance system comprises of 2nos minimum 2.0MP FHD IP based vandal proof Dome camera in lift car & in LMR/inside lift shaft top aimed on Lift machinery & controller with NVR kept in LMR/FCC with HDR data backup for 60 days with 18\" FHD TV monitor, to be kept in FCC/LMR as directed by Engineer In Charge LOP with SS face plate having recess/surface push button box for all landings with scrolling UP/DN LED indicator having metallic push buttons with Braille Code & luminous indicator around button with CPI, Lift car arrival & next travel direction audio-visual indication at all landings Lift controller based on microprocessor/ PLC with VVVF Drive having closed loop control system or VF regenerative closed loop, with IBMS compatible having necessary port, control panel duly wired with proper size & strength copper wire for power & control circuit, with provision for addition of floor/control card & allied accessories control panel having enclosure of 1.5mm CRCA sheet with powder coating with IP54 Protection class ARD complete with necessary SMF VRLA batteries Fireman controller having fireman switch at fire Landing-ground floor, Lift Machine of Gearless PMSM of suitable kW with Traction pulley, OSG, electromagnetic brakes, entire assembly mounted on adequate size girders duly fixed on LMR floor/ shaft walls complete with main/diverter traction sheaves, suspension wire ropes/belts of adequate size & strength Other mechanical parts such as 'T' section adequate size guide rails for car & counter weight with brackets fasteners, counter weight frame with necessary blocks, buffers with necessary support arrangement, MS pit ladder etc. erected with necessary steel work Minor civil work for alteration if any and erection of door frames and accessories, erection buffers, erection of lift machinery, adequate size core cuts if required & scaffolding for erecting guide rails fixing of girders for mounting lift machine etc. complete as per specification no. LFT. ?Lift shaft available having clear size of 2425 mm wide x 1925 mm deep 1600 mm Pit depth, 4150 mm Overhead etc as required including for Lift travelling up to eight floors or at a speed of 1.5 to 1.75 mps, for Lift having 1000/1100mm wide x 2100mm high clear entrance in 1.5mm thick SS 304 grade landing door [Two panel-as approved by Engineer-In-Charge], this includes all necessary accessories like LOP's with UP/DN buttons-arrows-indicators, extension of guide rails, shaft wiring with trucking, traveling cables, main hoisting ropes/belts, & OSG rope landing doors with all accessories etc. necessary for the normal safe functioning of lift installation complete. For Full Collective control system. General: - Job includes entire procedure of obtaining all necessary erection permissions & \"License to Work the Lift\" from Electrical Inspector (Lifts) with submission to the Engineer In Charge. Warrantee: - Job covers three years of onsite warranty for all the Lift parts with Full Comprehensive Annual Maintenance Contract as per the maintenance schedule.",
    unit: "No",
    qty: 10,
    rate: 3461452,
    amount: 34614520,
    remarks: "The lifts under reference were originally supplied during the year 2019; however, the installation and commissioning could not be taken up at that time. Consequently, the lift equipment remained stored at the stilt floor of the building for an extended period. Upon restoration and resumption of the work during 2025, it was observed that a substantial portion of the equipment had deteriorated and become unserviceable due to prolonged storage and exposure to environmental conditions. It was also examined whether the existing lifts should be replaced with entirely new lift systems. However, in certain blocks, the lift doors, door frames, guide channels and allied components had already been installed. Procurement of new lifts would necessitate dismantling and removal of the existing installed components, resulting in avoidable wastage of materials and loss of residual value. Further, the salvaged value of the dismantled materials would be minimal when compared to their original cost. It is estimated that the provision of entirely new lift systems would involve an expenditure of approximately ₹55.00 lakh to ₹56.00 lakh per lift, leading to a substantial additional financial burden on the project. In view of the above and considering the present operational requirements, statutory safety standards, and the conditions stipulated for obtaining Lift NOC from the competent authority, comprehensive retrofitting and rehabilitation of the existing lift systems has been considered the most economical and technically feasible option. Net approved rate ₹34,61,452/lift (after deducting existing usable components: guide rails ₹80,000, door frames ₹3,00,000, lift doors ₹2,00,000; total deduction ₹5,80,000 from gross ₹40,41,452)."
  },
  {
    sno: 22,
    item_code: "Non-SOR-22",
    category: "Elevators & Lifts",
    name: "Retrofitting & Restoration of Passenger Lifts - Thyssenkrupp G+12 (Batch 2: 10 Lift Units)",
    description: "Retro fitting of passenger lifts Replacing, recondensing, restoring ,Installation and testing & commissioning of passenger elevator Electric Traction Passenger Lift of makes: Thyssenkrupp Elevator with Rated capacity:- 15 Passenger/1020Kg Floors :- G+12 floor (13Stops/13 Landings) Travel :- 40-42 mtrs Location of Lift Machine:- MRL Rated speed :- 1.5 to 1.75 mps VS Doors type :- COPO/TOPO Doors with frame having clear opening of 1000/1100 mm wide x 2100 mm high . COP (two panel) with SS face plate having metallic push buttons with Braille Code & luminous indicator around button with FPI, scrolling UP/DN LED indicator & with/without attendant key switch, OWD with audio-visual alarm, VAS in Telugu & English with intercom system (Specification same as Sl.No 21).",
    unit: "No",
    qty: 10,
    rate: 3461452,
    amount: 34614520,
    remarks: "Same specification and justification as Sl.No. 21. Net adopted rate ₹34,61,452 per unit. Total ₹3,46,14,520 for 10 lift units."
  },
  {
    sno: 23,
    item_code: "Non-SOR-23",
    category: "Civil & Repair",
    name: "RCC Structural Repair & Filling of Holes up to 100mm dia with SBR/Epoxy & Polymer Mortar",
    description: "Repairing and filling of holes, voids, tie rod holes, and minor honeycombs in reinforced cement concrete (RCC) members such as beams, columns, slabs, and walls, by removing all loose and unsound concrete, cleaning the surface thoroughly, making the surface rough, applying approved bonding agent (SBR/epoxy), and filling with cement mortar in 1:3 (1 cement : 3 fine sand) or polymer modified mortar of approved make, including compacting, finishing the surface flush with surrounding concrete, curing, and disposal of debris within a lead of 50 m, complete as per the direction of Engineer-in-Charge. UP TO 100mm DIA.",
    unit: "Nos",
    qty: 16878,
    rate: 250,
    amount: 4219500,
    remarks: "The Rate is not available in any Government SoR. Adopted rate is based on market quotations and is lower than the prevailing market rate; hence, the rate is considered reasonable. Executed as per the applying approved bonding agent (SBR/epoxy), and filling with cement mortar in 1:3 (1 cement : 3 fine sand), hence quantity Supplemented."
  },
  {
    sno: 24,
    item_code: "Non-SOR-24",
    category: "Civil & Repair",
    name: "RCC Structural Repair & Filling of Holes up to 200mm dia with SBR/Epoxy & Polymer Mortar",
    description: "Repairing and filling of holes, up to 200mm dia/ holes voids, tie rod holes, and minor honeycombs in reinforced cement concrete (RCC) members such as beams, columns, slabs, and walls, by removing all loose and unsound concrete, cleaning the surface thoroughly, making the surface rough, applying approved bonding agent (SBR/epoxy), and filling with cement mortar in 1:3 (1 cement : 3 fine sand) or polymer modified mortar of approved make, including compacting, finishing the surface flush with surrounding concrete, curing, and disposal of debris within a lead of 50 m, complete as per the direction of Engineer-in-Charge.",
    unit: "Nos",
    qty: 9666,
    rate: 350,
    amount: 3383100,
    remarks: "The Rate is not available in any Government SoR. Adopted rate is based on market quotations and is lower than the prevailing market rate; hence, the rate is considered reasonable. Executed as per applying approved bonding agent and polymer modified mortar. Supplemented quantity."
  }
];

export const COMMITTEE_MEMBERS = [
  { name: "Sri R.G. Krishna Reddy", designation: "Group Director (ENC), APCRDA", role: "Chairman" },
  { name: "Sri P.V.K. Bhaskar", designation: "Chief Engineer, APCRDA", role: "Convenor" },
  { name: "Sri B. Narasimha Murthy", designation: "Chief Engineer, ADCL", role: "Member" },
  { name: "Sri Ch. Dhanunjaya", designation: "Chief Engineer, ADCL", role: "Member" },
  { name: "Sri M.V. Rao", designation: "Chief Engineer, APCRDA", role: "Member" },
  { name: "Sri G. Sudhakar Reddy", designation: "Chief Engineer, AGICL", role: "Member" },
  { name: "Sri P. Muralidhar", designation: "Chief Engineer-PMU, APCRDA", role: "Member" },
  { name: "Sri K.S. Chatterji", designation: "Contract Manager Expert, Pg MC", role: "Member" },
  { name: "Sri Harshavardhan", designation: "Chief Engineer (Electrical), AGICL", role: "Member" },
  { name: "Chief Engineer, APCRDA (Concerned)", designation: "Chief Engineer", role: "Convenor" }
];

export default function ApprovedNonSorItems() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [expandedItems, setExpandedItems] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  const categories = ['ALL', ...Array.from(new Set(APPROVED_NON_SOR_ITEMS.map(i => i.category)))];
  const totalSanctionedAmount = APPROVED_NON_SOR_ITEMS.reduce((sum, item) => sum + item.amount, 0);

  const filteredItems = APPROVED_NON_SOR_ITEMS.filter(item => {
    const matchCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchSearch = !searchTerm || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.item_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.remarks.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  const toggleExpand = (sno) => {
    setExpandedItems(prev => ({ ...prev, [sno]: !prev[sno] }));
  };

  const expandAll = () => {
    const all = {};
    APPROVED_NON_SOR_ITEMS.forEach(i => { all[i.sno] = true; });
    setExpandedItems(all);
  };

  const collapseAll = () => {
    setExpandedItems({});
  };

  const handleCopySpec = (item) => {
    const text = `Item: ${item.name}\nCode: ${item.item_code}\nQuantity: ${item.qty} ${item.unit}\nAdopted Rate: ₹${item.rate.toLocaleString('en-IN')}\nAmount: ₹${item.amount.toLocaleString('en-IN')}\n\nSpecification:\n${item.description}\n\nJustification:\n${item.remarks}`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.sno);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleCreateRfqFromItem = (item) => {
    navigate('/ce/tenders/create', {
      state: {
        prefillItem: {
          job_name: item.name,
          job_code: item.item_code,
          category: 'Supply Item',
          estimated_quantity: item.qty,
          unit: item.unit,
          unit_rate: item.rate,
          amount: item.amount,
          job_description: item.description
        }
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Quick Actions */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <Link
          to="/ce/dashboard"
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-gov-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm transition"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
          Back to Officer Dashboard
        </Link>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center text-xs font-semibold text-slate-700 hover:text-gov-800 bg-white border border-slate-300 hover:bg-slate-50 px-3.5 py-2 rounded-lg shadow-sm transition"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            Print Schedule
          </button>
          <a
            href="/docs/approved_non_sor_items_committee_minutes.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-xs font-bold text-white bg-gov-700 hover:bg-gov-800 px-3.5 py-2 rounded-lg shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Download PDF Report
          </a>
        </div>
      </div>

      {/* Official Government Order Header Banner */}
      <div className="bg-gradient-to-r from-gov-950 via-gov-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-gov-800 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Building2 className="w-80 h-80 text-white" />
        </div>
        
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gov-700/60 pb-4">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[11px] font-mono font-bold uppercase tracking-wider">
                OFFICIAL SANCTION PROCEEDINGS
              </span>
              <span className="text-slate-400 text-xs font-mono">• Committee Date: 06-08-2026 @ 5:00 PM</span>
            </div>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" />
              STATUS: APPROVED & ADOPTED
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-black text-amber-400 tracking-tight leading-snug">
              MINUTES OF THE COMMITTEE CONSTITUTED FOR REVIEW AND RECOMMENDATIONS OF QUOTATIONS FOR NON-SOR ITEMS
            </h1>
            <p className="text-xs text-slate-300 font-medium leading-relaxed max-w-5xl">
              <strong>Sub: APCRDA</strong> — "WORLD BANK & ADB financed Amaravati Capital City Development Program related to 
              <em> 'Completion of balance works viz., Architectural Finishes, Internal & External Electrical, Plumbing & Sanitary Fixtures, Fire Fighting Provisions, Lifts, DG, HVAC, Security Systems, External Development & Landscaping etc., for Multi Storied Quarters of 432 Apartment units in 18 towers of (S+12) Floors Pattern Buildings for Hon'ble MLAs & Hon'ble MLCs and All India Services Officers near Nelapadu, Amaravati, Andhra Pradesh'</em> 
              on Lumpsum Contract (% Percentage Tender) System with DLP of 2 Years" — <strong>Approval of Supplementary Non-SoR Items Rates</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-2 text-slate-300">
            <div className="bg-gov-900/60 p-3 rounded-lg border border-gov-700/40">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Sanction Order</span>
              <span className="font-semibold text-white">G.O.RT.No. 676 MA&UD (CRDA)</span>
              <span className="text-[11px] text-amber-300 block">Est: ₹524.70 Crores</span>
            </div>
            <div className="bg-gov-900/60 p-3 rounded-lg border border-gov-700/40">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Technical Sanction</span>
              <span className="font-semibold text-white">TS No. 06/CE/ Project Office/2024-25</span>
              <span className="text-[11px] text-amber-300 block">Dt: 30-12-2024 for ₹524.00 Cr</span>
            </div>
            <div className="bg-gov-900/60 p-3 rounded-lg border border-gov-700/40">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Committee Reference</span>
              <span className="font-semibold text-white">Resolution No. 467/2024 / MAU61-USI</span>
              <span className="text-[11px] text-emerald-300 block">Venue: APCRDA Office, Rayapudi</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-slate-500 font-semibold block">Total Approved Non-SoR Items</span>
          <span className="text-2xl font-black text-gov-900 mt-1 block">24 Items</span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Full BOQ Scope Defined</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-emerald-600 font-semibold block">Total Approved Sanction Value</span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">
            ₹{(totalSanctionedAmount / 10000000).toFixed(2)} Cr
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">₹18,83,36,712 Exact Total</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-blue-600 font-semibold block">Max Single Package (Lifts)</span>
          <span className="text-2xl font-black text-blue-700 mt-1 block">₹6.92 Cr</span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">20 Elevators Retrofitted</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-purple-600 font-semibold block">Committee Composition</span>
          <span className="text-2xl font-black text-purple-700 mt-1 block">10 Members</span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Group Director (ENC) & CEs</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Item code, description, specification, or make (e.g. Lifts, PU Foam, BIZZAR, FIBA)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-gov-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={expandAll}
              className="text-xs text-slate-600 hover:text-gov-700 font-medium px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded transition"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="text-xs text-slate-600 hover:text-gov-700 font-medium px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded transition"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-semibold text-[11px] mr-1 flex items-center">
            <Filter className="w-3 h-3 mr-1" /> Category:
          </span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition text-xs font-semibold ${
                selectedCategory === cat
                  ? 'bg-gov-800 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'ALL' ? 'All 24 Items' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* 24 Approved Items List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-gov-700" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Official Schedule of Approved Non-SoR Items ({filteredItems.length} of {APPROVED_NON_SOR_ITEMS.length})
            </span>
          </div>
          <span className="text-xs font-bold text-gov-800">
            Filtered Subtotal: ₹{filteredItems.reduce((s, i) => s + i.amount, 0).toLocaleString('en-IN')}
          </span>
        </div>

        <div className="divide-y divide-slate-200">
          {filteredItems.map((item) => {
            const isExpanded = !!expandedItems[item.sno];
            return (
              <div key={item.sno} className="p-4 sm:p-5 hover:bg-slate-50/60 transition">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start space-x-3 flex-1">
                    <span className="w-8 h-8 rounded-lg bg-gov-100 text-gov-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      {item.sno}
                    </span>
                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-mono text-[10px] font-bold">
                          {item.item_code}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[10px]">
                          {item.category}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 leading-snug">
                          {item.name}
                        </h3>
                      </div>

                      {/* Summary Metrics Row */}
                      <div className="flex flex-wrap items-center gap-4 text-xs pt-1 text-slate-600">
                        <div>
                          <span className="text-slate-400">Unit:</span> <strong>{item.unit}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400">Quantity:</span> <strong>{item.qty.toLocaleString('en-IN')}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400">Adopted Rate:</span> <strong className="text-gov-800">₹{item.rate.toLocaleString('en-IN')}</strong> / {item.unit}
                        </div>
                        <div>
                          <span className="text-slate-400">Total Sanction Amount:</span> <strong className="text-emerald-700 font-black">₹{item.amount.toLocaleString('en-IN')}</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Right */}
                  <div className="flex items-center space-x-2 shrink-0 self-end sm:self-start">
                    <button
                      onClick={() => handleCopySpec(item)}
                      className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-gov-700 bg-slate-100 hover:bg-slate-200 rounded-md transition flex items-center"
                      title="Copy full item details and specification to clipboard"
                    >
                      {copiedId === item.sno ? (
                        <>
                          <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                          <span className="text-emerald-600 font-semibold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 mr-1 text-slate-500" />
                          <span>Copy Spec</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleCreateRfqFromItem(item)}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-gov-700 hover:bg-gov-800 rounded-md transition flex items-center shadow-sm"
                      title="Raise New RFQ for this item directly"
                    >
                      <PlusCircle className="w-3.5 h-3.5 mr-1" />
                      Raise RFQ
                    </button>

                    <button
                      onClick={() => toggleExpand(item.sno)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition"
                      title={isExpanded ? "Collapse" : "View Full Specification"}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Specifications & Justification */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-200 text-xs space-y-3 bg-slate-50/70 p-4 rounded-xl">
                    <div>
                      <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block text-gov-800 mb-1">
                        Detailed Technical Specification (Verbatim Committee Minutes)
                      </span>
                      <p className="text-slate-700 leading-relaxed font-sans text-xs bg-white p-3 rounded-lg border border-slate-200 whitespace-pre-wrap">
                        {item.description}
                      </p>
                    </div>

                    <div>
                      <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block text-amber-800 mb-1">
                        Market Quotation Analysis & Technical Justification Remarks
                      </span>
                      <p className="text-slate-700 leading-relaxed font-sans text-xs bg-amber-50/60 p-3 rounded-lg border border-amber-200">
                        {item.remarks}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Official Committee Resolution Section */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 text-amber-900 font-bold text-sm uppercase tracking-wide">
          <Shield className="w-5 h-5 text-amber-700" />
          <span>Official Committee Resolution (Verbatim)</span>
        </div>

        <blockquote className="italic text-xs text-slate-800 bg-white p-4 rounded-xl border border-amber-300/60 leading-relaxed">
          "Hence, it is <strong>'RESOLVED THAT'</strong> the above-mentioned 24 Non-SOR items have been duly scrutinized and reviewed 
          by comparing the quotations received with the prevailing market rates through a detailed market rate analysis. 
          Upon such verification, it has been observed that the rates quoted and adopted are lower than the prevailing market rates 
          and are found to be reasonable and justified. Accordingly, the Committee hereby recommended the rates of the said Non-SOR items."
        </blockquote>

        {/* Committee Members Grid */}
        <div className="space-y-2 pt-2">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            High-Level Technical Review Committee Members & Signatories:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 text-xs">
            {COMMITTEE_MEMBERS.map((member, idx) => (
              <div key={idx} className="bg-white p-2.5 rounded-lg border border-amber-200/70 shadow-xs">
                <div className="font-bold text-slate-900">{member.name}</div>
                <div className="text-[11px] text-slate-500">{member.designation}</div>
                <div className="text-[10px] font-bold text-gov-700 uppercase mt-0.5">{member.role}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

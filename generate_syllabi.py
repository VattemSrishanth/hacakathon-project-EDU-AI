import json
import os

def generate_syllabus(board_name):
    syllabus = {
        "board": board_name,
        "classes": {}
    }

    for grade in range(1, 11):
        grade_key = str(grade)
        subjects = {}
        
        if grade <= 5:
            subject_list = ["Maths", "English", "EVS"]
        else:
            subject_list = ["Maths", "Science", "English", "Social Science"]

        for subject in subject_list:
            units = []
            
            if subject == "Maths":
                if grade <= 5:
                    ch_map = {
                        1: "Shapes and Space", 2: "Numbers from One to Nine", 3: "Addition",
                        4: "Subtraction", 5: "Numbers from Ten to Twenty", 6: "Time",
                        7: "Measurement", 8: "Numbers from Twenty-one to Fifty", 9: "Data Handling",
                        10: "Patterns", 11: "Numbers", 12: "Money", 13: "How Many"
                    }
                    for ch_id, ch_name in ch_map.items():
                        units.append({
                            "unit": f"Chapter {ch_id}: {ch_name}",
                            "topics": [f"Basic concepts of {ch_name}", "Practice exercises", "Mental maths", f"Applications of {ch_name}"]
                        })
                else:
                    if grade == 10:
                        units = [
                            {"unit": "Real Numbers", "topics": ["Euclid's Division Lemma", "Fundamental Theorem of Arithmetic", "Rational/Irrational Numbers", "Decimal Expansions"]},
                            {"unit": "Polynomials", "topics": ["Zeroes of Polynomial", "Geometrical Meaning", "Relationship between Zeroes and Coefficients"]},
                            {"unit": "Pair of Linear Equations", "topics": ["Graphical Solution", "Substitution Method", "Elimination Method", "Word Problems"]},
                            {"unit": "Quadratic Equations", "topics": ["Standard Form", "Solutions by Factorization", "Completing the Square", "Nature of Roots"]},
                            {"unit": "Arithmetic Progressions", "topics": ["nth Term", "Sum of First n Terms", "Daily Life Applications"]},
                            {"unit": "Triangles", "topics": ["Similar Figures", "Thales Theorem", "Pythagoras Theorem", "Area of Similar Triangles"]},
                            {"unit": "Coordinate Geometry", "topics": ["Distance Formula", "Section Formula", "Area of a Triangle"]},
                            {"unit": "Trigonometry", "topics": ["Trigonometric Ratios", "Specific Angles", "Identities", "Heights and Distances"]},
                            {"unit": "Statistics", "topics": ["Mean of Grouped Data", "Median and Mode", "Cumulative Frequency Map"]},
                            {"unit": "Probability", "topics": ["Theoretical Probability", "Events", "Complementary Events"]}
                        ]
                    elif grade == 6:
                        units = [
                            {"unit": "Knowing Our Numbers", "topics": ["Comparing Numbers", "Large Numbers", "Estimation", "Brackets"]},
                            {"unit": "Whole Numbers", "topics": ["Predecessor and Successor", "Number Line", "Properties"]},
                            {"unit": "Playing with Numbers", "topics": ["Factors and Multiples", "Prime/Composite", "HCF and LCM"]},
                            {"unit": "Basic Geometrical Ideas", "topics": ["Points", "Lines", "Angles", "Polygons"]},
                            {"unit": "Integers", "topics": ["Negative Numbers", "Number Line Operations"]},
                            {"unit": "Fractions", "topics": ["Proper/Improper", "Comparison of Fractions"]},
                            {"unit": "Decimals", "topics": ["Place Value", "Addition/Subtraction of Decimals"]}
                        ]
                    else:
                        units = [
                            {"unit": f"Chapter 1: Number Systems", "topics": ["Natural Numbers", "Integers", "Rational Numbers"]},
                            {"unit": f"Chapter 2: Geometry Basics", "topics": ["Points and Lines", "Angles", "Triangles"]},
                            {"unit": f"Chapter 3: Measurement", "topics": ["Length", "Weight", "Volume"]},
                            {"unit": f"Chapter 4: Data Handling", "topics": ["Pictographs", "Bar Graphs", "Averages"]}
                        ]

            elif subject == "Science":
                if grade == 10:
                    units = [
                        {"unit": "Chemical Reactions and Equations", "topics": ["Combination Reaction", "Decomposition", "Displacement", "Oxidation/Reduction"]},
                        {"unit": "Acids, Bases and Salts", "topics": ["Indicators", "pH Scale", "Common Salt", "Plaster of Paris"]},
                        {"unit": "Metals and Non-metals", "topics": ["Physical Properties", "Chemical Properties", "Reactivity Series", "Extraction"]},
                        {"unit": "Life Processes", "topics": ["Nutrition in Humans", "Respiration in Plants", "Transportation in Animals", "Excretion in Plants"]},
                        {"unit": "Control and Coordination", "topics": ["Nervous System", "Reflex Action", "Hormones in Animals"]},
                        {"unit": "Light - Reflection and Refraction", "topics": ["Ray Diagrams", "Lens Formula", "Refractive Index"]},
                        {"unit": "Human Eye and Colourful World", "topics": ["Defects of Vision", "Atmospheric Refraction", "Scattering of Light"]},
                        {"unit": "Electricity", "topics": ["Ohm's Law", "Resistors in Circuit", "Heating effect of current"]}
                    ]
                elif grade == 9:
                    units = [
                        {"unit": "Matter in Our Surroundings", "topics": ["States of Matter", "Latent Heat", "Evaporation"]},
                        {"unit": "Is Matter Around Us Pure?", "topics": ["Mixtures", "Solutions", "Colloids", "Physical/Chemical Changes"]},
                        {"unit": "Atoms and Molecules", "topics": ["Atomic Mass", "Valency", "Chemical Formulae"]},
                        {"unit": "The Fundamental Unit of Life", "topics": ["Nucleus", "Cytoplasm", "Mitochondria", "Cell Wall"]},
                        {"unit": "Tissues", "topics": ["Meristematic Tissue", "Epithelial Tissue", "Connective Tissue"]},
                        {"unit": "Motion", "topics": ["Uniform Motion", "Velocity-Time Graphs", "Circular Motion"]},
                        {"unit": "Force and Laws of Motion", "topics": ["Inertia", "Newton's Second Law", "Momentum Conservation"]}
                    ]
                else:
                    units = [
                        {"unit": "Food and Components", "topics": ["Carbohydrates", "Proteins", "Vitamins", "Balanced Diet"]},
                        {"unit": "Fibre to Fabric", "topics": ["Natural Fibres", "Spinning", "Weaving"]},
                        {"unit": "Sorting Materials", "topics": ["Transparency", "Hardness", "Solubility"]},
                        {"unit": "Body Movements", "topics": ["Skeletal System", "Joints", "Gait of Animals"]},
                        {"unit": "The Living Organisms", "topics": ["Habitats", "Adaptations", "Surroundings"]},
                        {"unit": "Electricity and Circuits", "topics": ["Electric Cell", "Switch", "Insulators"]}
                    ]

            elif subject == "Social Science":
                if board_name == "NCERT":
                    units = [
                        {"unit": "History: Nationalism in India", "topics": ["Non-Cooperation Movement", "Civil Disobedience", "Quit India Movement"]},
                        {"unit": "Geography: Resources", "topics": ["Land and Soil", "Water and Wildlife", "Minerals"]},
                        {"unit": "Civics: Power Sharing", "topics": ["Federalism", "Democracy and Diversity", "Political Parties"]},
                        {"unit": "Economics: Development", "topics": ["Sectors of Economy", "Money and Credit", "Globalisation"]}
                    ]
                elif board_name == "Telangana":
                    units = [
                        {"unit": "History: The Movement for Telangana", "topics": ["1969 Agitation", "Gentlemen's Agreement", "JAC", "Final Formation 2014"]},
                        {"unit": "Geography: Physical Features of Telangana", "topics": ["Deccan Plateau", "Godavari and Krishna Rivers", "Mission Kakatiya", "Forests and Wildlife"]},
                        {"unit": "Civics: Welfare State", "topics": ["Arogyasri", "Kalyana Lakshmi", "Mission Bhagiratha", "Rythu Bandhu"]},
                        {"unit": "Economics: Telangana Economy", "topics": ["Agriculture in TS", "IT Sector in Hyderabad", "Handicrafts"]}
                    ]
                elif board_name == "Andhra Pradesh":
                    units = [
                        {"unit": "History: Modern Andhra History", "topics": ["Impact of British Rule", "Sri Potti Sriramulu Movement", "Bifurcation of AP 2014"]},
                        {"unit": "Geography: Coastal Districts of AP", "topics": ["Eastern Ghats", "Bay of Bengal Influence", "Industrial Corridors", "Irrigation Projects"]},
                        {"unit": "Civics: Local Governance", "topics": ["Gram Panchayats", "Municipalities", "Digital Governance in AP"]},
                        {"unit": "Economics: Agriculture and Ports", "topics": ["Aqua Culture", "Major Ports Vizag/Kakinada", "State Finances Post-Bifurcation"]}
                    ]
                
                if grade < 10:
                    units = [
                        {"unit": "Understanding Our Society", "topics": ["Diversity", "Inequality", "Social Reforms"]},
                        {"unit": "Earth and Environment", "topics": ["Continents", "Oceans", "Global Warming"]},
                        {"unit": "Life in Localities", "topics": ["Rural Life", "Urban Settlements", "Market Systems"]},
                        {"unit": "Governing the Country", "topics": ["Elections", "Judiciary", "Parliament Basics"]}
                    ]

            elif subject == "EVS":
                units = [
                    {"unit": "Our Body and Health", "topics": ["Sense Organs", "Personal Hygiene", "Healthy Food"]},
                    {"unit": "Plants and Animals", "topics": ["What do they eat?", "Where do they live?", "Life cycles"]},
                    {"unit": "Water and Air", "topics": ["Uses of Water", "Saving Water", "Clean Air Habits"]},
                    {"unit": "Transport and Safety", "topics": ["Means of Travel", "Road Safety Rules", "Emergency Contacts"]}
                ]
                if board_name == "Telangana":
                    units.append({"unit": "Telangana Culture", "topics": ["Bonalu", "Bathukamma", "Pochampally Weaving", "Local Temples"]})
                elif board_name == "Andhra Pradesh":
                    units.append({"unit": "Andhra Traditions", "topics": ["Kuchipudi Dance", "Kondapalli Toys", "Sankranti Celebrations", "Local Crafts"]})

            else: # English
                units = [
                    {"unit": "Grammar and Syntax", "topics": ["Sentence Structure", "Tenses", "Direct/Indirect Speech", "Active/Passive"]},
                    {"unit": "Literature appreciation", "topics": ["Reading Classics", "Poetic Devices", "Thematic Analysis", "Character Sketches"]},
                    {"unit": "Creative Writing", "topics": ["Letter Writing", "Essay Composition", "Story Telling", "Debate Skills"]},
                    {"unit": "Vocabulary and Usage", "topics": ["Idioms and Phrases", "Synonyms/Antonyms", "Etymology", "Contextual Meaning"]}
                ]

            subjects[subject] = units
            
        syllabus["classes"][grade_key] = {"subjects": subjects}
    
    return syllabus

boards = ["NCERT", "Telangana", "Andhra Pradesh"]
data_dir = "frontend/src/data"
os.makedirs(data_dir, exist_ok=True)

for board in boards:
    filename = f"{board.lower().replace(' ', '_')}_syllabus.json"
    filepath = os.path.join(data_dir, filename)
    print(f"Generating {filename}...")
    data = generate_syllabus(board)
    with open(filepath, "w") as f:
        json.dump(data, f, indent=2)

print("Syllabus generation complete.")

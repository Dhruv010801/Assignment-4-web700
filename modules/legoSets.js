class LegoData {
    constructor() {
        this.sets = [];  // Correct: setup property inside constructor
    }

    addSet(newSet) {
        return new Promise((resolve, reject) => {
            const exists = this.sets.find(set => set.set_num === newSet.set_num);
            if (exists) {
                reject("Set already exists");
            } else {
                this.sets.push(newSet);
                resolve(); // Successfully added
            }
        });
    }

    async initialize() {
        // Loads set and theme data asynchronously
        return new Promise((resolve, reject) => {
            try {
                this.setData = require("../data/setData.json"); // Load set data
                this.themeData = require("../data/themeData.json"); // Load theme data
                resolve(); // Resolves the Promise once data is loaded
            } catch (error) {
                reject(`Failed initialization: ${error.message}`); // Handles loading errors
            }
        });
    }
    
    async getAllSets() {
        // Processes set data by matching themes
        return new Promise((resolve, reject) => {
            try {
                this.sets = this.setData.map(setElement => {
                    // Finds matching theme for each set
                    const themeObject = this.themeData.find(themeElement => themeElement.id === setElement.theme_id);
                    // Assigns theme name or a default placeholder
                    setElement.theme = themeObject ? themeObject.name : "Unknown theme";
                    return setElement;
                });
                resolve(this.sets); // Returns processed sets
            } catch (error) {
                reject(`Couldn't get all the sets: ${error.message}`); // Handles processing errors
            }
        });
    }

    async getSetByNum(setNum) {
        // Retrieves a LEGO set by its unique set number
        return new Promise((resolve, reject) => {
            try {
                resolve(this.sets.find(setElement => setElement.set_num === setNum)); // Returns matching set
            } catch (error) {
                reject(`Unable to find requested set: ${error.message}`); // Handles lookup errors
            };
        });
    }

    async getSetsByTheme(theme) {
        // Filters sets by a given theme name (case-insensitive)
        return new Promise((resolve, reject) => {
            try {
                const setsByTheme = this.sets.filter(setElement => 
                    setElement.theme.toLowerCase().includes(theme.toLowerCase())
                );
                resolve(setsByTheme); // Returns filtered sets
            } catch (error) {
                reject(`Unable to find the requested set: ${error.message}`); // Handles filtering errors
            }
        });
    }
}

module.exports = LegoData;
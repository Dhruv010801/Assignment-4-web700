const fs = require('fs');
const path = require('path');

class LegoData {
    constructor() {
        this.sets = [];
        this.themes = [];
        this.setDataPath = path.join(__dirname, '..', 'data', 'setData.json');
        this.themeDataPath = path.join(__dirname, '..', 'data', 'themeData.json');
    }

    async initialize() {
        return new Promise((resolve, reject) => {
            try {
                this.setData = JSON.parse(fs.readFileSync(this.setDataPath, 'utf8'));

                // ✅ Ensure theme IDs are strings
                this.themes = JSON.parse(fs.readFileSync(this.themeDataPath, 'utf8')).map(theme => ({
                    ...theme,
                    id: String(theme.id)
                }));

                // Map and add theme names to sets
                this.sets = this.setData.map(setElement => {
                    const themeObject = this.themes.find(t => t.id === String(setElement.theme_id));
                    setElement.theme = themeObject ? themeObject.name : "Unknown theme";
                    return setElement;
                });

                resolve();
            } catch (error) {
                reject(`Failed initialization: ${error.message}`);
            }
        });
    }

    async getAllSets() {
        return new Promise((resolve, reject) => {
            try {
                resolve(this.sets);
            } catch (error) {
                reject(`Couldn't get all the sets: ${error.message}`);
            }
        });
    }

    async getSetByNum(setNum) {
        return new Promise((resolve, reject) => {
            try {
                const match = this.sets.find(set => set.set_num === setNum);
                if (match) {
                    resolve(match);
                } else {
                    reject("Set not found");
                }
            } catch (error) {
                reject(`Unable to find requested set: ${error.message}`);
            }
        });
    }

    async getSetsByTheme(theme) {
        return new Promise((resolve, reject) => {
            try {
                const setsByTheme = this.sets.filter(set =>
                    set.theme.toLowerCase().includes(theme.toLowerCase())
                );
                resolve(setsByTheme);
            } catch (error) {
                reject(`Unable to find the requested set: ${error.message}`);
            }
        });
    }

    async addSet(newSet) {
        return new Promise(async (resolve, reject) => {
            try {
                const exists = this.sets.find(set => set.set_num === newSet.set_num);
                if (exists) {
                    reject("Set already exists");
                } else {
                    let foundTheme = this.themes.find(t => t.id == newSet.theme_id);
                    if (!foundTheme) {
                        reject("Invalid theme_id");
                        return;
                    }

                    newSet.theme = foundTheme.name;

                    this.sets.push(newSet);
                    this.setData.push(newSet);

                    fs.writeFile(this.setDataPath, JSON.stringify(this.setData, null, 2), (err) => {
                        if (err) {
                            reject("Failed to save new set to file: " + err);
                        } else {
                            resolve();
                        }
                    });
                }
            } catch (err) {
                reject("Error adding set: " + err);
            }
        });
    }

    deleteSetByNum(setNum) {
        return new Promise((resolve, reject) => {
            const index = this.sets.findIndex(set => set.set_num === setNum);
            if (index !== -1) {
                this.sets.splice(index, 1);
                this.setData.splice(index, 1);

                fs.writeFile(this.setDataPath, JSON.stringify(this.setData, null, 2), (err) => {
                    if (err) {
                        reject("Failed to update file: " + err);
                    } else {
                        resolve();
                    }
                });
            } else {
                reject("Set not found");
            }
        });
    }

    getAllThemes() {
        return new Promise((resolve, reject) => {
            if (this.themes.length > 0) {
                resolve(this.themes);
            } else {
                reject("no themes available");
            }
        });
    }

    getThemeById(id) {
        return new Promise((resolve, reject) => {
            const theme = this.themes.find(t => t.id == id);
            if (theme) {
                resolve(theme);
            } else {
                reject("unable to find requested theme");
            }
        });
    }
}

module.exports = LegoData;

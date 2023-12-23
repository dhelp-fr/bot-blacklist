const sqlite3 = require("sqlite3");
module.exports = class BlackListDatabase {
    /**
     * @type {BlackListClient}
     */
    #client;

    /**
     * @type {Database}
     */
    #db;
    constructor(client) {
        this.#client = client;
        this.#db = new sqlite3.Database('database/Database.sqlite');
        this.#init();
    }

    #init() {
        this.#db.run(
            'CREATE TABLE IF NOT EXISTS `blacklist` (' +
            'user_id VARCHAR(32) PRIMARY KEY,' +
            'timestamp VARCHAR(24),' +
            'reason VARCHAR(100),' +
            'username VARCHAR(32)' +
            ')'
        )
    }

    /**
     *
     * @param key
     * @returns {Promise<{user_id: string, timestamp: string, reason: string, username: string}>}
     */
    async get(key) {
        return new Promise((resolve, reject) => {
            this.#db.get(`SELECT * FROM blacklist WHERE user_id='${key}'`, (err, row) => {
                if (err)reject(err);
                resolve(row)
            });
        });
    }

    async remove(key) {
        this.#db.get(`DELETE FROM blacklist WHERE user_id='${key}'`, (err, row) => {
            if (err)throw (err);
        });
    }


    /**
     * @returns {Promise<{user_id: string, timestamp: string, reason: string, username: string}[]>}
     */
    async getAll(limit = 25, where = null) {
        return new Promise((resolve, reject) => {
            this.#db.all('SELECT * FROM `blacklist` ' + (where ? `WHERE ${where}` : '') + (limit === -1 ? "LIMIT 0, 40" : `LIMIT ${limit};`), (err, row) => {
                if (err)reject(err);
                resolve(Array.isArray(row) ? row : [row]);
            });
        });
    }

    /**
     * @param {string} key
     * @param {{timestamp: string, reason: string, username: string}} value
     * @returns {Promise<boolean>}
     */
    async add(key, value) {
        return new Promise((resolve, reject) => {
            this.#db.run(`INSERT INTO \`blacklist\` VALUES ('${key}', '${value.timestamp}', '${value.reason}', '${value.username}')`,
                (err) => {
                    if (err)reject(err);
                    resolve({user_id: key,...value})
                });
        });
    }

    async has(key) {
        return new Promise((resolve, reject) => {
            this.#db.get(`SELECT count(*) as c FROM blacklist WHERE user_id='${key}'`, (err, row) => {
                if (err)reject(err);
                resolve(row.c != 0);
            });
        });
    }

    async getIfExist(key) {
        return await this.has(key) ? this.get(key) : null;
    }

    /**
     * @param {string} key
     * @param {{timestamp: string, reason: string, username: string}} value
     * @returns {Promise<boolean>}
     */
    async AddIfNew(key, value){
        return (await this.has(key)) ? false : this.add(key, value);
    }
}
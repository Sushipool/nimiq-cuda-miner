const fs = require('fs');
const JSON5 = require('json5');
const Nimiq = require('@nimiq/core');

exports.humanHashrate = function (hashes, decimals = 1) {
    let thresh = 1000;
    if (Math.abs(hashes) < thresh) {
        return hashes + ' H/s';
    }
    let units = ['kH/s', 'MH/s', 'GH/s', 'TH/s', 'PH/s', 'EH/s', 'ZH/s', 'YH/s'];
    let u = -1;
    do {
        hashes /= thresh;
        ++u;
    } while (Math.abs(hashes) >= thresh && u < units.length - 1);
    return hashes.toFixed(decimals) + ' ' + units[u];
}

exports.readConfigFile = function (fileName) {
    try {
        const config = JSON5.parse(fs.readFileSync(fileName));
        // TODO: Validate
        return config;
    } catch (e) {
        Nimiq.Log.e(`Failed to read config file ${fileName}: ${e.message}`);
        return false;
    }
}

exports.getNewHost = function(currentHost) {
    const FALLBACK_HOSTS = [
        'eu.sushipool.com',
        'us.sushipool.com',
        'asia.sushipool.com'
    ];
    let idx = FALLBACK_HOSTS.indexOf(currentHost);
    if (idx !== -1) {
        // if current host is found in fallback hosts, then try the next one
        idx = (idx + 1) % FALLBACK_HOSTS.length; 
    } else { // otherwise just randomly choose one fallback host
        idx = Math.floor(Math.random() * FALLBACK_HOSTS.length);
    }
    const newHost = FALLBACK_HOSTS[idx];
    return newHost;
}

exports.getDeviceOptions = function (config) {
    const devices = Array.isArray(config.devices) ? config.devices : [];
    const memory = Array.isArray(config.memory) ? config.memory : [];
    const threads = Array.isArray(config.threads) ? config.threads : [];
    const cache = Array.isArray(config.cache) ? config.cache : [];
    const memoryTradeoff = Array.isArray(config.memoryTradeoff) ? config.memoryTradeoff : [];

    const getOption = (values, deviceIndex) => {
        if (values.length > 0) {
            const value = (values.length === 1) ? values[0] : values[(devices.length === 0) ? deviceIndex : devices.indexOf(deviceIndex)];
            if (Number.isInteger(value)) {
                return value;
            }
        }
        return undefined;
    };

    return {
        forDevice: (deviceIndex) => {
            const enabled = (devices.length === 0) || devices.includes(deviceIndex);
            if (!enabled) {
                return {
                    enabled: false
                };
            }
            return {
                enabled: true,
                memory: getOption(memory, deviceIndex),
                threads: getOption(threads, deviceIndex),
                cache: getOption(cache, deviceIndex),
                memoryTradeoff: getOption(memoryTradeoff, deviceIndex),
            };
        }
    }
}

import { load } from './storage.js'
import { popupE } from "@/app/lib/trigger"

export function getData(setData, endpoint, parameters, baseURL = process.env.NEXT_PUBLIC_API_URL, token = load('token')) {
    //map parameters to get parameter format
    let params = new URLSearchParams(parameters).toString();
    const url = `${baseURL}${endpoint}?${params}`;
    fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        },
        credentials: 'include',
        cache: 'no-store'
    })
        .then((res) => {
            if (res.status === 401) {
                window.location.href = '/login';
                return;
            }
            if (res.status === 404) {
                console.error(`API 404 Not Found: ${url}`);
            }
            if (!res.ok) {
                return res.json().then(errData => {
                    throw new Error(errData.message || 'Server Error');
                });
            }
            return res.json();
        })
        .then(data => {
            if (!data) return;
            if (data.error) popupE('Error', data.error)
            else
                try {
                    setData(data);
                } catch (err) {
                    // setData error
                }
        })
        .catch(err => {
            // handle err
        });
}

export function getFile(name, endpoint, parameters, token = load('token')) {
    let params = new URLSearchParams(parameters).toString();
    popupE('Processing', 'Please wait...')
    fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}?${params}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': '*/*'
        },
        credentials: 'include'
    })
        .then((res) => {
            if (!res.ok) {
                return res.json().then(errData => {
                    throw new Error(errData.message || 'Server Error');
                });
            }
            return res.blob();
        })
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = name;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            popupE('Success', 'File downloaded successfully');
        })
        .catch(err => {
            popupE('Error', 'Server Error')
        });
}

export function downloadFile(url) {
    window.open(url, '_blank', 'noopener,noreferrer');
}

export function postFile(setData, files, key, data, endpoint, baseURL = process.env.NEXT_PUBLIC_API_URL, token = load('token')) {
    popupE('Processing', 'Please wait...')
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        if (Array.isArray(data[key])) {
            data[key].forEach(item => formData.append(`${key}[]`, item));
        } else {
            formData.append(key, data[key]);
        }
    });

    if (Array.isArray(files)) {
        files.forEach((file) => {
            formData.append(`${key}[]`, file);
        });
    } else {
        formData.append(key, files);
    }


    fetch(`${baseURL}${endpoint}`, {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        },
        credentials: 'include',
        body: formData
    })
        .then((res) => {
            if (!res.ok) {
                return res.json().then(errData => {
                    if (errData.errors) throw new Error(errData.errors[Object.keys(errData.errors)[0]]);
                    else throw new Error(errData.message);
                });
            }
            return res.json();
        })
        .then((data) => {
            if (data.error) popupE('Error', data.error)
            if (data.message && data.success) popupE('Success', data.message)
            try {
                setData(data);
            } catch (err) {
                popupE('Error', 'Error in client worker')
            }
        })
        .catch(err => {
            console.error(`Network error POST ${endpoint}:`, err);
            let errorMessage = err?.message || 'Server File upload Error';
            if (err && err.errors) {
                errorMessage = err.errors[Object.keys(err.errors)[0]];
            }
            popupE('Error', errorMessage);
            try {
                setData({ success: false, message: errorMessage });
            } catch (e) {
                console.error("Callback error:", e);
            }
        });
}

export async function postData(setData, data, endpoint, baseURL = process.env.NEXT_PUBLIC_API_URL, token = load('token'), customHeaders = {}, showPopups = true) {
    if (showPopups) popupE('Processing', 'Please wait...')
    const url = `${baseURL}${endpoint}`;
    fetch(url, {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...customHeaders
        },
        credentials: 'include',
        body: JSON.stringify(data)
    })
        .then((res) => {
            if (res.status === 401) {
                window.location.href = '/login';
                return;
            }
            if (res.status === 404) {
                console.error(`API 404 Not Found: ${url}`);
            }
            if (!res.ok) {
                return res.json().then(errData => {
                    if (errData.errors) throw new Error(errData.errors[Object.keys(errData.errors)[0]]);
                    else throw new Error(errData.message);
                });
            }
            return res.json();
        })
        .then((data) => {
            if (!data) return;
            if (data.success === false) {
                if (showPopups) popupE('Error', data.message || 'Error occurred')
            }
            else if (data?.success) {
                if (showPopups) {
                    if (data?.message) popupE('Success', data.message)
                    else popupE('Success', 'Completed') // Default success to override "Processing"
                }
            }
            try {
                setData(data);
            } catch (err) {
                if (showPopups) popupE('Error', 'Error in client worker')
            }
        })
        .catch(err => {
            console.error(`Network error POST ${endpoint}:`, err);
            let errorMessage = err?.message || 'Server Error';
            if (err && err.errors) {
                errorMessage = err.errors[Object.keys(err.errors)[0]];
            }
            if (showPopups) popupE('Error', errorMessage);
            try {
                setData({ success: false, message: errorMessage });
            } catch (e) {
                console.error("Callback error:", e);
            }
        });
}

export async function putData(setData, data, endpoint, baseURL = process.env.NEXT_PUBLIC_API_URL, token = load('token')) {
    popupE('Processing', 'Please wait...')
    fetch(`${baseURL}${endpoint}`, {
        method: "PUT",
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data)
    })
        .then((res) => {
            if (!res.ok) {
                return res.json().then(errData => {
                    if (errData.errors) throw new Error(errData.errors[Object.keys(errData.errors)[0]]);
                    else throw new Error(errData.message);
                });
            }
            return res.json();
        })
        .then((data) => {
            if (data.success === false) popupE('Error', data.message)
            if (data?.success && data?.message) popupE('Success', data.message)
            try {
                setData(data);
            } catch (err) {
                popupE('Error', 'Error in client worker')
            }
        })
        .catch(err => {
            console.error(`Network error PUT ${endpoint}:`, err);
            let errorMessage = err?.message || 'Server Error';
            if (err && err.errors) {
                errorMessage = err.errors[Object.keys(err.errors)[0]];
            }
            popupE('Error', errorMessage);
            try {
                setData({ success: false, message: errorMessage });
            } catch (e) {
                console.error("Callback error:", e);
            }
        });
}

export async function deleteData(setData, data, endpoint, baseURL = process.env.NEXT_PUBLIC_API_URL, token = load('token')) {
    popupE('Processing', 'Please wait...')
    fetch(`${baseURL}${endpoint}`, {
        method: "DELETE",
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data)
    })
        .then((res) => {
            if (!res.ok) {
                return res.json().then(errData => {
                    if (errData.errors) throw new Error(errData.errors[Object.keys(errData.errors)[0]]);
                    else throw new Error(errData.message);
                });
            }
            return res.json();
        })
        .then((data) => {
            if (data.success === false) popupE('Error', data.message)
            if (data?.success && data?.message) popupE('Success', data.message)
            setData(data);
        })
        .catch(err => {
            console.error(`Network error DELETE ${endpoint}:`, err)
            let errorMessage = err?.message || 'Server Error';
            popupE('Error', errorMessage);
            try {
                setData({ success: false, message: errorMessage });
            } catch (e) {
                console.error("Callback error:", e);
            }
        })
}

export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function fetcher([endpoint, parameters, baseURL = process.env.NEXT_PUBLIC_API_URL, token = load('token')]) {
    // await delay(2000)
    let params = new URLSearchParams(parameters).toString();
    const url = `${baseURL}${endpoint}?${params}`;
    return fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        },
        credentials: 'include',
        cache: 'no-store'
    })
        .then((res) => {
            if (res.status === 401) {
                window.location.href = '/login';
                return;
            }
            if (res.status === 404) {
                console.error(`API 404 Not Found: ${url}`);
            }
            if (!res.ok) {
                return res.json().then(errData => {
                    throw new Error(errData.message || 'Server Error');
                });
            }
            return res.json();
        })
}

export async function postFetcher([endpoint, parameters, baseURL = process.env.NEXT_PUBLIC_API_URL, token = load('token')]) {
    return fetch(`${baseURL}${endpoint}`, {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(parameters),
        credentials: 'include'
    })
        .then((res) => {
            if (!res.ok) {
                return res.json().then(errData => {
                    throw new Error(errData.message || 'Server Error');
                });
            }
            return res.json();
        })
}

export async function putFetcher([endpoint, parameters, baseURL = process.env.NEXT_PUBLIC_API_URL, token = load('token')]) {
    return fetch(`${baseURL}${endpoint}`, {
        method: "PUT",
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(parameters),
        credentials: 'include'
    })
        .then((res) => {
            if (!res.ok) {
                return res.json().then(errData => {
                    throw new Error(errData.message || 'Server Error');
                });
            }
            return res.json();
        })
}

export async function blobFetcher([url, token = load('token')]) {
    return fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        },
        credentials: 'include'
    })
        .then((res) => {
            if (!res.ok) {
                return res.json().then(errData => {
                    throw new Error(errData.message || 'Server Error');
                });
            }
            return res.blob();
        });
}
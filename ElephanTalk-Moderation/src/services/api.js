const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const GetReports = async ({ token, endpoint = "", query = "" }) => {
    const response = await fetch(`${BASE_URL}/toxicity-reports/${endpoint}?${query}`, {
        method: "GET",
        headers: {
            "Content-Type" : "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    if(!response.ok){
        throw new Error("");
    }
    
    return await response.json();
};

export const ChangeStatus = async ({token, id, status}) => {    
    const requestBody = {
        status: status
    };

    try {
        const response = await fetch(`${BASE_URL}/toxicity-reports/${id}/decide?`, {
            method: 'PATCH', // or 'PUT', depending on your API's requirements
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json()
    } catch (error) {
        console.error('Error:', error);
    }
};



import { useCommonStore } from "../store/commonStore";

const baseDomain = 'http://172.233.155.175:5000'
export const contentApi = async (query: string) => {
    const url = `${baseDomain}/${query}`;
    
    try{
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }catch (error) {
        console.error('Error fetching content:', error);
        throw error;
    }
}


export const loginApi = async (email: string, password?: string, otp?: string) => {
    const { setauthToken, setUser } = useCommonStore.getState();
    const url = `${baseDomain}/api/auth/login`;
    if (!email || (!password && !otp)) {
        throw new Error('Email and password or OTP are required');
    }
    const body: { email: string; password?: string; otp?: string } = { email };
    if (password) body.password = password;
    if (otp) body.otp = otp;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (response.status === 401) {
            throw new Error('Invalid email or password');
        }
        const data = await response.json();
        if (data.success) {
            setauthToken(data.token);
            setUser(data.user);
        }
        return data;
    } catch (error) {
        console.error('Error logging in');
        throw error;
    }
};

export const isSubscribed = async () => {
    const {setShowMultiLoginPopup,setShowSubscriptionPopup,setremainingBalance, authToken, setauthToken, clearUser, clearauthToken, setUser} = useCommonStore.getState();
    const url = `${baseDomain}/api/auth/verify-token`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify({ token: authToken }),
        });
        if (response.status === 401) {
            setShowMultiLoginPopup(true);
            clearauthToken();
            clearUser();
            setremainingBalance(0);
            throw new Error('Unauthorized access. Please log in again.');
        }
        const data = await response.json();

        if(data.success) {
            const expiryDate = new Date(data.user.balance); // assuming balance is a UTC timestamp
            const today = new Date();
            const diffTime = expiryDate.getTime() - today.getTime();
            const remainingDays = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 0);
            setremainingBalance(remainingDays);
            setUser(data.user);
            console.log(remainingDays);
            
           if (remainingDays <= 0) {
                setShowSubscriptionPopup(true);
                return false; // Subscription expired
            } 
            return true; // Subscription active
        }

        return false; // Subscription not active
    } catch (error) {
        console.error('Error verifying token:', error);
        return false; // Default to not subscribed on error
    }

}
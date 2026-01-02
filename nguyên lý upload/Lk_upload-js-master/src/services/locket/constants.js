const constants = {
    LOGIN_URL:
        "https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=AIzaSyCQngaaXQIfJaH0aS2l7REgIjD7nL431So",
    LOGIN_HEADERS: {
        Accept: "*/*",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "en",
        baggage:
            "sentry-environment=production,sentry-public_key=78fa64317f434fd89d9cc728dd168f50,sentry-release=com.locket.Locket@1.82.0+3,sentry-trace_id=90310ccc8ddd4d059b83321054b6245b",
        Connection: "keep-alive",
        "Content-Type": "application/json",
        Host: "www.googleapis.com",
        "sentry-trace": "90310ccc8ddd4d059b83321054b6245b-3a4920b34e94401d-0",
        "User-Agent":
            "FirebaseAuth.iOS/10.23.1 com.locket.Locket/1.82.0 iPhone/18.0 hw/iPhone12_1",
        "X-Client-Version": "iOS/FirebaseSDK/10.23.1/FirebaseCore-iOS",
        "X-Firebase-AppCheck":
            "eyJraWQiOiJNbjVDS1EiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIxOjY0MTAyOTA3NjA4Mzppb3M6Y2M4ZWI0NjI5MGQ2OWIyMzRmYTYwNiIsImF1ZCI6WyJwcm9qZWN0c1wvNjQxMDI5MDc2MDgzIiwicHJvamVjdHNcL2xvY2tldC00MjUyYSJdLCJwcm92aWRlciI6ImRldmljZV9jaGVja19kZXZpY2VfaWRlbnRpZmljYXRpb24iLCJpc3MiOiJodHRwczpcL1wvZmlyZWJhc2VhcHBjaGVjay5nb29nbGVhcGlzLmNvbVwvNjQxMDI5MDc2MDgzIiwiZXhwIjoxNzIyMTY3ODk4LCJpYXQiOjE3MjIxNjQyOTgsImp0aSI6ImlHUGlsT1dDZGg4Mll3UTJXRC1neEpXeWY5TU9RRFhHcU5OR3AzTjFmRGcifQ.lqTOJfdoYLpZwYeeXtRliCdkVT7HMd7_Lj-d44BNTGuxSYPIa9yVAR4upu3vbZSh9mVHYS8kJGYtMqjP-L6YXsk_qsV_gzKC2IhVAV6KbPDRHdevMfBC6fRiOSVn7vt749GVFdZqAuDCXhCILsaMhvgDBgZoDilgAPtpNwyjz-VtRB7OdOUbuKTCqdoSOX0SJWVUMyuI8nH0-unY--YRctunK8JHZDxBaM_ahVggYPWBCpzxq9Yeq8VSPhadG_tGNaADStYPaeeUkZ7DajwWqH5ze6ESpuFNgAigwPxCM735_ZiPeD7zHYwppQA9uqTWszK9v9OvWtFCsgCEe22O8awbNbuEBTKJpDQ8xvZe8iEYyhfUPncER3S-b1CmuXR7tFCdTgQe5j7NGWjFvN_CnL7D2nudLwxWlpqwASCHvHyi8HBaJ5GpgriTLXAAinY48RukRDBi9HwEzpRecELX05KTD2lTOfQCjKyGpfG2VUHP5Xm36YbA3iqTDoDXWMvV",
        "X-Firebase-GMPID": "1:641029076083:ios:cc8eb46290d69b234fa606",
        "X-Ios-Bundle-Identifier": "com.locket.Locket",
    },
    UPLOADER_HEADERS: {
        "content-type": "application/octet-stream",
        "x-goog-upload-protocol": "resumable",
        "x-goog-upload-offset": "0",
        "x-goog-upload-command": "upload, finalize",
        "upload-incomplete": "?0",
        "upload-draft-interop-version": "3",
        "user-agent":
            "com.locket.Locket/1.43.1 iPhone/17.3 hw/iPhone15_3 (GTMSUF/1)",
    },
    CREATE_POST_URL: "https://api.locketcamera.com/postMomentV2",
    REFRESH_URL: "https://securetoken.googleapis.com/v1/token?key=AIzaSyB5dTd-xiLD5dEfWq5OpptnQtnMpE0W0u8",
    REFRESH_HEADERS: {
        "Accept-Encoding": "gzip",
        "Accept-Language": "en-US",
        "Connection": "keep-alive",
        "Content-Length": "294",
        "Content-Type": "application/json",
        "Host": "securetoken.googleapis.com",
        "User-Agent": "FirebaseAuth.iOS/10.23.1 com.locket.Locket/1.82.0 iPhone/18.0 hw/iPhone12_1",
        "X-Android-Cert": "187A27D3D7364A044307F56E66230F973DCCD5B7",
        "X-Android-Package": "com.locket.Locket",
        "X-Firebase-Client": "H4sIAAAAAAAAAKtWykhNLCpJSk0sKVayio7VUSpLLSrOzM9TslIyUqoFAFyivEQfAAAA"
    },
    FETCH_FRIEND: (userID) => `https://firestore.googleapis.com/v1/projects/locket-4252a/databases/(default)/documents/users/${userID}/friends`,
    FETCH_FRIEND_HEADER: (token) => ({
        'Accept': '*/*',
        'Accept-Language': 'en-GB,en;q=0.9',
        'Authorization': `Bearer ${token}`,
        'Connection': 'keep-alive',
        'Content-Type': 'application/json',
        'X-Client-Version': 'iOS/FirebaseSDK/10.23.1/FirebaseCore-iOS',
        'X-Firebase-GMPID': '1:641029076083:ios:cc8eb46290d69b234fa606',
        'X-Ios-Bundle-Identifier': 'com.locket.Locket',
        'X-Firebase-AppCheck':
            'eyJraWQiOiJNbjVDS1EiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.' +
            'eyJzdWIiOiIxOjY0MTAyOTA3NjA4Mzppb3M6Y2M4ZWI0NjI5MGQ2OWIyMzRmYTYwNiIsImF1ZCI6WyJwcm9qZWN0c1wvNjQxMDI5MDc2MDgzIiwicHJvamVjdHNcL2xvY2tldC00MjUyYSJdLCJwcm92aWRlciI6ImRldmljZV9jaGVja19kZXZpY2VfaWRlbnRpZmljYXRpb24iLCJpc3MiOiJodHRwczpcL1wvZmlyZWJhc2VhcHBjaGVjay5nb29nbGVhcGlzLmNvbVwvNjQxMDI5MDc2MDgzIiwiZXhwIjoxNzIyMjQwNjcwLCJpYXQiOjE3MjIyMzcwNzAsImp0aSI6ImFMTmF3aHlBc3E2a2ROT1FRTS1PT1FwX2gyTlU1ZDZGZUdIcUZoYTJZWXMifQ.' +
            'C1dXXEB_4q1-hWNkEV66HmycPNRiTHLn3nBoVrwmIEQ2opJ6S9rO4h7_K2_EdsMQkut_p-dGU8GiWZyBLi6MohzIfANfWggYS_Et2l6ZjCGJish-lt6FlIForpe4PAnG6OPreEL1qyzjFqD5IBN0FvdKuhEFMpDwBHQeSuubpkfRaki67jxR016cAZy6VDb42H2dqTH2t7rhwr5VCzErtzEKm711DTrFm0Rxgnvk8TcqOhjno6CDkUvfFc4RYMDmPVIuuX6H8zNBDVcvR5LFmZD5eo38lUwwQU1BoyQfgEMXp2w86MjtYm6KrF7U9TUfrgMz9I5e66oFBn5vqIUE594Pi7jmkcxbt_mW29FH3B4HIIAzvI-4WrVgGSkVidq6kZGKDfBt5NjxBYzfDiOtWtnUyUJmziZAbXayrYkRoJP2g8DS2Dsc-NvwIXVV_29YdgxYFIW1PjhTp2gmXMVTb4uHHUaMmd0j4Y4NgtgPwcVswSwawgy3e6C6-K01X6Xx'
    }),
    FETCH_ADDITONAL_DATA: (userID) => `https://firestore.googleapis.com/v1/projects/locket-4252a/databases/(default)/documents/users/${userID}`

};

module.exports = constants;

const config = {
    RegisterOptions: {
        Username_Length: [8, 16],
        Password_Length: [8, 16],

        Email_Regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        Password_Regex: /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={}[\]|:;"'<>,.?/~`]).*$/
    }
}

export default config
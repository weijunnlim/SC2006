import { useState, useEffect} from 'react'

const useTokenVerification = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [isValidToken, setIsValidToken] = useState(false)

    useEffect(() => {
        const verifyToken = async () => {
            try{
                const usertoken = localStorage.getItem('token')
                
                if(usertoken === false) {
                    setIsValidToken(false)
                    setIsLoading(false)
                    return
                }

                let token = {
                    token:usertoken
                }

                //console.log(token)


                const response = await fetch('http://localhost:4000/api/authentication/verifyToken', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(token)
                })



                const json = await response.json()
                console.log(json.message)
                setIsValidToken(json.message)
                setIsLoading(false)

            } catch (error){
                console.log(error.message)
                console.error('Error verifying token: ', error)
                setIsValidToken(false)
                setIsLoading(false)

            }
        }

        verifyToken()

    }, [])

    return { isLoading, isValidToken}
}

export default useTokenVerification
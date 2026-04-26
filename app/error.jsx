'use client'
function Error({ statusCode }) {
    return (
        <p className="flex w-[100vw] h-[100vh] items-center justify-center">
        {statusCode
            ? `An error ${statusCode} occurred on server`
            : 'An error occurred on client side'}
        <br/>
        Contact support? 0791210705
        </p>
    )
}

Error.getInitialProps = ({ res, err }) => {
    const statusCode = res ? res.statusCode : err ? err.statusCode : 404
    return { statusCode }
}

export default Error
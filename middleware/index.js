import jwt from 'jsonwebtoken';


const VerifyToken = async (req, res, next) => {

    const { authorization } = req.headers
    const token = authorization.split(' ')[1];

    const secret = process.env.JWT_SECRET || 'MS_SECRET';
    jwt.verify(token, secret, function (err, decoded) {
        if (err) {
            return res.status(401).send({ message: 'unauthorized', error: err.message })
        }
        return next()
    });
}


export default VerifyToken;
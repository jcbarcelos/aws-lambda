#1o passo criar arquivo de politicas de segurança
#2o criar role de segurança na AWS
aws iam create-role \
    --role-name lambda-exemplo1 \
    --assume-role-policy-document file://politicas.json \
    | tee logs/role.log

#3o criar arquivo com conteudo e zipa-lo
zip function.zip index.js

aws lambda create-function \
    --function-name hello-cli \
    --zip-file fileb://function.zip \
    --handler index.handler \
    --runtime nodejs14.x \
    --role arn:aws:iam::231968220883:role/lambda-exemplo \
    | tee logs/lambda-create.log

#4o invoke lambda
aws lambda invoke \
    --function-name hello-cli \
    --log-type Tail \
    logs/lambda-exec.log

#5o Atualizar, zip
zip function.zip index.js

aws lambda update-function-code \
    --zip-file fileb://function.zip \
    --function-name hello-cli \
    --publish \
    | tee logs/lambda-update.log
# invoke
aws lambda invoke \
    --function-name hello-cli \
    --log-type Tail \
    logs/lambda-exec.log

#remover
aws lambda delete-function \
    --function-name hello-cli \

aws iam delete-role \
    --role-name lambda-exemplo1

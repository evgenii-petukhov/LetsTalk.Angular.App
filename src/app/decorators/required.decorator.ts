import 'reflect-metadata';
const requiredMetadataKey = Symbol('required');

export const required = (target: object, propertyKey: string | symbol, parameterIndex: number) => {
    const existingRequiredParameters: number[] = Reflect.getOwnMetadata(requiredMetadataKey, target, propertyKey) || [];
    existingRequiredParameters.push(parameterIndex);
    Reflect.defineMetadata(requiredMetadataKey, existingRequiredParameters, target, propertyKey);
};
export const validate = (target: any, propertyName: string, descriptor: TypedPropertyDescriptor<(...args: any) => void>) => {
    const method = descriptor.value;

    descriptor.value = function() {
        const requiredParameters: number[] = Reflect.getOwnMetadata(requiredMetadataKey, target, propertyName);
        if (requiredParameters) {
            for (const parameterIndex of requiredParameters) {
                if (parameterIndex >= arguments.length || !arguments[parameterIndex]) {
                    throw new Error('Missing required argument.');
                }
            }
        }
        return method.apply(this, arguments);
    };
};

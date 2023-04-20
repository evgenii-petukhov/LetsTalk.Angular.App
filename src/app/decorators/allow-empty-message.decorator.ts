import { ChatComponent } from '../components/chat/chat.component';

export const allowEmptyMessage = (value: boolean) => (_target: ChatComponent, _propertyKey: string, descriptor: PropertyDescriptor) => {
    const method = descriptor.value;

    descriptor.value = function(message: string) {
        if (!value && message.trim().length === 0) { return; }
        method.apply(this, [message]);
    };
};

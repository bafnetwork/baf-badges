import { Input, Form } from 'antd';
import { Controller, Control } from 'react-hook-form';

export interface TextInputProps<TFieldValues> {
	control: Control<TFieldValues>;
	label: string;
	fieldName: any;
	placeholder?: string;
	helpMsg?: string;
}


// wrapper component for using antd with react-hook-form
// note: this type parameter should be inferred 100% of the time by props.control
// if it's not being inferred for you, something is probably wrong (maybe not you)
export function TextInput<TFieldValues>(props: TextInputProps<TFieldValues>) {
	return (
		<Controller
			control={props.control}
			name={props.fieldName}
			render={({ field: { onChange, onBlur, value }}) => (
				<Form.Item
					label={props.label}
					help={props.helpMsg}
				>
					<Input
						onBlur={onBlur}
						onChange={onChange}
						value={value as any}
						placeholder={props.placeholder}
					/>
				</Form.Item>
			)}
		/>
	)
}

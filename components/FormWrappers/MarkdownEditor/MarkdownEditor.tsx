import ReactMde from 'react-mde';
import { Form } from 'antd';
import { useState } from 'react';
import { Controller, Control } from 'react-hook-form';
import { Markdown } from '../../Markdown';

export interface MarkdownEditorProps<TFieldValues> {
	control: Control<TFieldValues>;
	label: string;
	fieldName: any;
	helpMsg?: string;
}

// TODO: support image uploads
export function MarkdownEditor<TFieldValues>(props: MarkdownEditorProps<TFieldValues>) {
	const [tab, setTab] = useState<"write" | "preview">("write");

	return (
		<Controller
			control={props.control}
			name={props.fieldName}
			render={({ field: { onChange, value }}) => (
				<Form.Item
					label={props.label}
					help={props.helpMsg}
				>
					<ReactMde
						value={value as any}
						onChange={onChange}
						selectedTab={tab}
						onTabChange={setTab}
						generateMarkdownPreview={
							(md) => Promise.resolve(<Markdown md={md}/>)
						}
						childProps={{
							writeButton: {
							tabIndex: -1
							}
						}}
					/>
				</Form.Item>
				
			)}
		/>
	)
}
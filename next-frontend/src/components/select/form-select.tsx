import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";

interface FormSelectProps {
	name: string;
	defaultValue: string;
	dataList: { id: number; name: string }[];
}

export default function FormSelect({
	name,
	defaultValue,
	dataList,
}: FormSelectProps) {
	return (
		<Select name={name} defaultValue={defaultValue}>
			<SelectTrigger id={name} className="w-full">
				<SelectValue placeholder={`Select a ${name}`} />
			</SelectTrigger>
			<SelectContent position="popper" side="bottom">
				<SelectGroup>
					{dataList.map((item) => (
						<SelectItem key={item.id} value={item.id.toString()}>
							{item.name}
						</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
	);
}

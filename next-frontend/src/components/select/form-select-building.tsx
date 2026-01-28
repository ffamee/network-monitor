import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "../ui/select";

interface FormSelectProps {
	name: string;
	defaultValue: string;
	dataList: {
		id: number;
		name: string;
		buildings: { id: number; name: string }[];
	}[];
}

export default function FormSelectBuilding({
	name,
	defaultValue,
	dataList,
}: FormSelectProps) {
	return (
		<Select name={name} defaultValue={defaultValue} required>
			<SelectTrigger id={name} className="w-full">
				<SelectValue placeholder={`Select a ${name}`} />
			</SelectTrigger>
			<SelectContent position="popper" side="bottom">
				{dataList.map((item) => (
					<SelectGroup key={item.id}>
						<SelectLabel>{item.name}</SelectLabel>
						{item.buildings.map((building) => (
							<SelectItem key={building.id} value={building.id.toString()}>
								{building.name}
							</SelectItem>
						))}
					</SelectGroup>
				))}
			</SelectContent>
		</Select>
	);
}

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Filter } from "lucide-react";

interface FilterDropdownProps {
  onFilterChange: (user: string, minValue?: number) => void;
}

export default function FilterDropdown({ onFilterChange }: FilterDropdownProps) {
  const [user, setUser] = useState<string>("");
  const [minValue, setMinValue] = useState<string>("");

  const handleApplyFilter = () => {
    onFilterChange(
      user,
      minValue ? parseFloat(minValue) : undefined
    );
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center">
          <Filter className="h-4 w-4 mr-2 text-gray-400" />
          Filtrar
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-gray-500 uppercase tracking-wider">Filtros</h4>
          
          <div className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="responsavel">Responsável</Label>
              <Select value={user} onValueChange={setUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="user1">Maria Silva</SelectItem>
                  <SelectItem value="user2">João Oliveira</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="minValue">Valor mínimo</Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 pointer-events-none">
                  R$
                </span>
                <Input
                  id="minValue"
                  type="number"
                  placeholder="0,00"
                  className="pl-8"
                  value={minValue}
                  onChange={(e) => setMinValue(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <Button className="w-full" onClick={handleApplyFilter}>
            Aplicar
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CommandItem } from "@/components/ui/command";
import { PlusIcon, CheckIcon } from "@radix-ui/react-icons";
import { fetchApiData } from "@/app/api/appService";
import { useToast } from "@/hooks/use-toast"
import { useAppContext } from "@/app/AppProvider";

interface AddGenreProps {
  onAddGenre: (newGenre: { genreId: string; name: string }) => void;
}

const AddGenre: React.FC<AddGenreProps> = ({ onAddGenre }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [genreName, setGenreName] = useState("");
    const { toast } = useToast();
    const { accessToken } = useAppContext()
  
    const handleAddGenre = async () => {
      if (!genreName.trim()) {
        toast({
          title: "Error",
          description: "Genre name cannot be empty.",
          variant: "destructive",
        });
        return;
      }
  
      try {
        const response = await fetchApiData(
          "/api/admin/create/genre",
          "POST",
          JSON.stringify({ name: genreName }),
          accessToken
        );
  
        if (response.success) {
          toast({
            title: "Success",
            description: `Genre "${genreName}" has been added successfully.`,
            variant: "success",
          });
          onAddGenre(response.data.genre);
          setGenreName("");
          setIsAdding(false);
        } else if (response.error === "Genre exists") {
          toast({
            title: "Duplicate Genre",
            description: "This genre already exists. Please try another name.",
            variant: "destructive",
          });
        } else {
          throw new Error(response.error || "Unknown error occurred.");
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to add genre. Please try again.",
          variant: "destructive",
        });
        console.error("Failed to add genre:", error);
      }
    };
  
    return (
      <>
        {!isAdding ? (
          <CommandItem
            onSelect={() => setIsAdding(true)}
            className="font-bold text-primaryColorBlue bg-darkerBlue hover:text-primaryColorBlueHover cursor-pointer"
          >
            <span>
              <PlusIcon />
            </span>{" "}
            Add New Genre
          </CommandItem>
        ) : (
          <div className="flex items-center gap-2 px-2 py-2">
            <Input
              placeholder="Enter new genre"
              maxLength={150}
              value={genreName}
              onChange={(e) => setGenreName(e.target.value)}
              className="flex-1 border-darkerBlue"
            />
            <Button onClick={handleAddGenre} className="shrink-0 p-2">
              <CheckIcon className="w-5 h-5 text-primaryColorPinkHover" />
            </Button>
          </div>
        )}
      </>
    );
  };
  
export default AddGenre;

use proc_macro::TokenStream;
use quote::{format_ident, quote};
use syn::{parse_macro_input, DeriveInput, Fields, Type};

#[proc_macro_derive(Minimize, attributes(include, include_rewrite))]
pub fn derive_minimize(input: TokenStream) -> TokenStream {
    let input = parse_macro_input!(input as DeriveInput);
    let name = &input.ident;
    let minimized_name = format_ident!("Minimized{}", name);

    let fields = match &input.data {
        syn::Data::Struct(syn::DataStruct {
            fields: Fields::Named(named),
            ..
        }) => &named.named,
        _ => panic!("Minimize only supports structs with named fields"),
    };

    let minimized_fields = fields.iter().filter_map(|f| {
        let include_field = f.attrs.iter().any(|attr| attr.path().is_ident("include"));
        if include_field {
            return Some((false, f));
        };

        let include_rewrite_field = f
            .attrs
            .iter()
            .any(|attr| attr.path().is_ident("include_rewrite"));
        if include_rewrite_field {
            return Some((true, f));
        };

        None
    });

    let field_defs = minimized_fields.clone().map(|(should_rewrite, f)| {
        let field_name = &f.ident;
        if should_rewrite {
            let (ty, _) =
                convert_type(&f.ty, field_name).unwrap_or_else(|| (quote! { #(&f.ty) }, quote! {}));
            return quote! {
                pub #field_name: #ty
            };
        } else {
            let ty = &f.ty;
            return quote! {
                pub #field_name: #ty
            };
        }
    });

    let field_inits = minimized_fields.clone().map(|(should_rewrite, f)| {
        let field_name = &f.ident;
        if should_rewrite {
            let (_, init_expr) = convert_type(&f.ty, field_name)
                .unwrap_or_else(|| (quote! {}, quote! { orig.#field_name }));
            return quote! {
                #field_name: #init_expr
            };
        } else {
            return quote! {
                #field_name: orig.#field_name.into()
            };
        }
    });

    let output = quote! {
        #[derive(Debug, serde::Serialize, serde::Deserialize)]
        pub struct #minimized_name {
            #(#field_defs,)*
        }

        impl From<#name> for #minimized_name {
            fn from(orig: #name) -> Self {
                Self {
                    #(#field_inits,)*
                }
            }
        }
    };

    output.into()
}

// Detects types like `B`, `Option<B>`, `Vec<B>` and rewrites them to `MinimizedB`, etc.
fn convert_type(
    ty: &Type,
    field_name: &Option<syn::Ident>,
) -> Option<(proc_macro2::TokenStream, proc_macro2::TokenStream)> {
    let field_access = quote! { orig.#field_name };

    match ty {
        Type::Path(type_path) => {
            let segment = type_path.path.segments.last().unwrap();
            let ident = &segment.ident;

            match &segment.arguments {
                syn::PathArguments::AngleBracketed(args) if args.args.len() == 1 => {
                    let inner = match &args.args[0] {
                        syn::GenericArgument::Type(inner_ty) => inner_ty,
                        _ => return None,
                    };

                    if ident == "Vec" {
                        if let Some((min_ty, _)) = convert_type(inner, field_name) {
                            return Some((
                                quote! { Vec<#min_ty> },
                                quote! { #field_access.into_iter().map(Into::into).collect() },
                            ));
                        }
                    }

                    // Handle other wrappers (Option, Box) here...
                }
                _ => {}
            }

            // For plain types: Foo -> MinimizedFoo
            let min_ty = format_ident!("Minimized{}", ident);
            Some((quote! { #min_ty }, quote! { #field_access.into() }))
        }
        _ => None,
    }
}
